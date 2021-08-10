import {useMachine} from '@xstate/react'
import React from 'react'
import {assign, createMachine} from 'xstate'
import {log} from 'xstate/lib/actions'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentity} from '../../shared/providers/identity-context'
import {apiMethod} from '../../shared/utils/utils'

function useValidationScore() {
  const [{totalShortFlipPoints, totalQualifiedFlips}] = useIdentity()
  return Math.min(totalShortFlipPoints / totalQualifiedFlips, 1)
}

export function useValidationReportSummary() {
  const [{address, availableFlips}] = useIdentity()

  const epoch = useEpochState()

  const score = useValidationScore()

  const [current, send] = useMachine(
    createMachine({
      context: {
        earnings: 0,
        missedRewards: 0,
        earningsScore: 0,
      },
      initial: 'idle',
      states: {
        idle: {on: {FETCH: 'fetching'}},
        fetching: {
          invoke: {
            // eslint-disable-next-line no-shadow
            src: async (_, {epoch, address}) => {
              const {result: rewardsSummary} = await (
                await fetch(apiMethod(`epoch/${epoch}/rewardsSummary`))
              ).json()

              const {result: identityRewards} = await (
                await fetch(
                  apiMethod(`epoch/${epoch}/identity/${address}/rewards`)
                )
              ).json()

              return {rewardsSummary, identityRewards}
            },
            onDone: 'fetched',
          },
        },
        fetched: {
          entry: [
            log(),
            assign((context, ev) => {
              console.log({ev})
              const {
                data: {rewardsSummary, identityRewards},
              } = ev
              if (identityRewards !== null) {
                // eslint-disable-next-line no-shadow
                const earnings = (identityRewards ?? []).reduce(
                  (acc, curr) =>
                    acc + Number(curr.balance) + Number(curr.stake),
                  0
                )

                const flipRewards = identityRewards.find(
                  r => r.type === 'Flips'
                )

                // eslint-disable-next-line no-shadow
                const missedRewards =
                  rewardsSummary.flipsShare * availableFlips -
                  (Number(flipRewards.balance) + Number(flipRewards.stake))

                const earningsScore = earnings / (earnings + missedRewards)

                return {
                  ...context,
                  earnings,
                  missedRewards,
                  earningsScore,
                }
              }
              return {
                ...context,
                earnings: 0,
                missedRewards: rewardsSummary.flipsShare * availableFlips,
                earningsScore: 0.05,
              }
            }),
          ],
        },
      },
    })
  )

  React.useEffect(() => {
    if (epoch?.epoch && address) send('FETCH', {epoch: epoch?.epoch, address})
  }, [address, epoch, send])

  return {
    ...current.context,
    score,
    isLoading: current.matches('fetching'),
  }
}
