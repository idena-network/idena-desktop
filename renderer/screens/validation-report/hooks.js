import {useMachine} from '@xstate/react'
import React from 'react'
import {assign, createMachine} from 'xstate'
import {log} from 'xstate/lib/actions'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentity} from '../../shared/providers/identity-context'
import {apiMethod} from '../../shared/utils/utils'
import {ValidationResult} from './types'

export function useTotalValidationScore() {
  const [{totalShortFlipPoints, totalQualifiedFlips}] = useIdentity()
  return Math.min(totalShortFlipPoints / totalQualifiedFlips, 1)
}

export function useValidationReportSummary() {
  const [identity] = useIdentity()

  const epoch = useEpochState()

  const totalScore = useTotalValidationScore()

  const [current, send] = useMachine(
    createMachine({
      context: {
        earnings: 0,
        missedRewards: 0,
        earningsScore: 0,
        lastValidationScore: {
          short: {},
          long: {},
        },
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            FETCH: 'fetching',
          },
        },
        fetching: {
          // eslint-disable-next-line no-shadow
          entry: [assign({identity: (_, {identity}) => identity})],
          invoke: {
            src: async (_, {epochNumber, identity: {address}}) => {
              const fetchJson = async url =>
                (await (await fetch(apiMethod(url))).json()).result

              const validationSummary = await fetchJson(
                `Epoch/${epochNumber}/Identity/${address}/ValidationSummary`
              )

              return validationSummary
            },
            onDone: 'fetched',
          },
        },
        fetched: {
          entry: [
            log(),
            assign(
              (
                {identity: {isValidated}, ...context},
                {
                  data: {
                    shortAnswers,
                    longAnswers,
                    shortAnswersCount,

                    penalized,
                    missed,
                    rewards,
                  },
                }
              ) => {
                const safeNumber = num => Number(num ?? 0)

                const maybePenaltyReward = (cond => plannedReward =>
                  cond ? 0 : plannedReward)(penalized)

                const earnedReward = k => safeNumber(rewards[k].earned)
                const missedReward = k => safeNumber(rewards[k].missed)

                const {totalEarnedReward, totalMissedReward} = Object.keys(
                  rewards
                ).reduce(
                  // eslint-disable-next-line no-shadow
                  ({totalEarnedReward, totalMissedReward}, key) => ({
                    totalEarnedReward:
                      safeNumber(totalEarnedReward) + earnedReward(key),
                    totalMissedReward:
                      safeNumber(totalMissedReward) + missedReward(key),
                  }),
                  {}
                )

                const flipScore = ({point, flipsCount}) => point / flipsCount

                const lastValidationScore = {
                  short: {
                    ...shortAnswers,
                    score: flipScore(shortAnswers),
                  },
                  long: {
                    ...longAnswers,
                    score: flipScore(longAnswers),
                  },
                }

                // eslint-disable-next-line no-nested-ternary
                const validationResult = isValidated
                  ? penalized
                    ? ValidationResult.Penalty
                    : ValidationResult.Success
                  : // eslint-disable-next-line no-nested-ternary
                  missed
                  ? shortAnswersCount
                    ? ValidationResult.LateSubmission
                    : ValidationResult.MissedValidation
                  : ValidationResult.WrongAnswers

                return {
                  ...context,
                  validationResult,
                  earnings: totalEarnedReward,
                  totalMissedReward,
                  earningsScore: totalEarnedReward / totalMissedReward,
                  validationReward: earnedReward('validation'),
                  missedValidationReward: missedReward('validation'),
                  invitationReward: maybePenaltyReward(
                    earnedReward('invitations')
                  ),
                  missedInvitationReward: missedReward('invitations'),
                  flipReward: earnedReward('flips'),
                  missedFlipReward: missedReward('flips'),
                  flipReportReward: earnedReward('reports'),
                  missedFlipReportReward: missedReward('reports'),
                  lastValidationScore,
                }
              }
            ),
          ],
        },
      },
    })
  )

  React.useEffect(() => {
    if (epoch && identity?.address)
      send('FETCH', {
        epochNumber: epoch?.epoch - 1,
        identity,
      })
  }, [epoch, identity, send])

  return {
    ...current.context,
    totalScore,
    isLoading: current.matches('fetching'),
  }
}
