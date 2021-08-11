import {useMachine} from '@xstate/react'
import React from 'react'
import {assign, createMachine} from 'xstate'
import {log} from 'xstate/lib/actions'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentity} from '../../shared/providers/identity-context'
import {IdentityStatus} from '../../shared/types'
import {apiMethod} from '../../shared/utils/utils'

export function useValidationScore() {
  const [{totalShortFlipPoints, totalQualifiedFlips}] = useIdentity()
  return Math.min(totalShortFlipPoints / totalQualifiedFlips, 1)
}

export function useValidationReportSummary() {
  const [identity] = useIdentity()

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
        idle: {
          on: {
            FETCH: {
              target: 'fetching',
              actions: [
                assign({
                  // eslint-disable-next-line no-shadow
                  identity: (_, {identity}) => identity,
                  // eslint-disable-next-line no-shadow
                  epochNumber: (_, {epochNumber}) => epochNumber,
                }),
              ],
            },
          },
        },
        fetching: {
          entry: [log()],
          invoke: {
            // eslint-disable-next-line no-shadow
            src: async ({epochNumber, identity: {address}}) => {
              const fetchJson = async url =>
                (await (await fetch(apiMethod(url))).json()).result

              const rewardsSummary = await fetchJson(
                `epoch/${epochNumber}/rewardsSummary`
              )

              const identityRewards = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/rewards`
              )

              const epochIdentity = await fetchJson(
                `epoch/${epochNumber}/identity/${address}`
              )

              const validationPenalty = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/authors/bad`
              )

              const rewardedInvites = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/rewardedInvites`
              )

              const savedInvites = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/savedInviteRewards`
              )

              const availableInvites = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/availableInvites`
              )

              const reportRewards = await fetchJson(
                `epoch/${epochNumber}/identity/${address}/reportRewards`
              )

              return {
                rewardsSummary,
                identityRewards,
                epochIdentity,
                validationPenalty,
                rewardedInvites,
                savedInvites,
                availableInvites,
                reportRewards,
              }
            },
            onDone: 'fetched',
          },
        },
        fetched: {
          entry: [
            log(),
            assign(
              (
                {
                  epochNumber,
                  identity: {availableFlips, isValidated},
                  ...context
                },
                {
                  data: {
                    rewardsSummary,
                    identityRewards,
                    epochIdentity: {birthEpoch, state: identityStatus},
                    validationPenalty,
                    rewardedInvites,
                    savedInvites,
                    availableInvites,
                    reportRewards,
                  },
                }
              ) => {
                if (identityRewards !== null) {
                  // eslint-disable-next-line no-shadow
                  const earnings = identityRewards.reduce(
                    (acc, curr) =>
                      acc + Number(curr.balance) + Number(curr.stake),
                    0
                  )

                  const identityRewardMap = identityRewards.reduce(
                    (acc, curr) => ({...acc, [curr.type]: curr}),
                    {}
                  )

                  const rewardByType = type => {
                    const {balance, stake} = identityRewardMap[type]
                    return Number(balance) + Number(stake)
                  }

                  const flipRewards = rewardByType('Flips')

                  // eslint-disable-next-line no-shadow
                  const missedFlipReward =
                    rewardsSummary.flipsShare * availableFlips - flipRewards

                  const missedValidationReward =
                    !isValidated || Boolean(validationPenalty)
                      ? (epochNumber - birthEpoch) ** (1 / 3) *
                        rewardsSummary.validationShare
                      : 0

                  const isValidatedIdentity = ({state}) =>
                    [
                      IdentityStatus.Newbie,
                      IdentityStatus.Verified,
                      IdentityStatus.Human,
                    ].includes(state)

                  const getRewardedData = (
                    // eslint-disable-next-line no-shadow
                    epoch,
                    // eslint-disable-next-line no-shadow
                    rewardsSummary,
                    // eslint-disable-next-line no-shadow
                    rewardedInvites,
                    // eslint-disable-next-line no-shadow
                    validationPenalty,
                    identityInfo
                  ) => {
                    if (!rewardsSummary || !rewardedInvites) {
                      return []
                    }
                    return rewardedInvites
                      .map(item => {
                        if (item.killInviteeHash || !item.activationHash) {
                          return null
                        }

                        // eslint-disable-next-line no-shadow
                        let isValidated = false
                        let result = '-'

                        if (item.state) {
                          if (isValidatedIdentity(item)) {
                            isValidated = true
                            result = 'Successfull'
                          } else {
                            result = 'Failed'
                          }
                        }

                        let rewardCoef = 3
                        if (item.epoch === epoch - 1) {
                          rewardCoef *= 3
                        } else if (item.epoch === epoch - 2) {
                          rewardCoef *= 6
                        }

                        let invitationReward
                        let missingInvitationReward
                        let reason

                        invitationReward =
                          rewardsSummary.invitationsShare * rewardCoef
                        missingInvitationReward = 0
                        reason = '-'

                        if (isValidated && validationPenalty) {
                          reason = 'Validation penalty'
                          missingInvitationReward = invitationReward
                          invitationReward = 0
                        } else if (!isValidated) {
                          reason = 'Invitee failed'
                          missingInvitationReward = invitationReward
                          invitationReward = 0
                        } else if (
                          identityInfo &&
                          !isValidatedIdentity(identityInfo)
                        ) {
                          missingInvitationReward = invitationReward
                          invitationReward = 0
                          reason = 'My validation failed'
                        } else if (!item.rewardType) {
                          missingInvitationReward = invitationReward
                          invitationReward = 0
                          reason = 'Another issuer'
                        }

                        return {
                          epoch: item.epoch,
                          hash: item.hash,
                          activationAuthor: item.activationAuthor,
                          validationResult: result,
                          invitationReward,
                          missingInvitationReward,
                          reason,
                        }
                      })
                      .filter(Boolean)
                  }

                  const getCurrentEpochSavedInvites = (
                    // eslint-disable-next-line no-shadow
                    epoch,
                    // eslint-disable-next-line no-shadow
                    savedInvites,
                    // eslint-disable-next-line no-shadow
                    rewardsSummary
                  ) => {
                    if (!savedInvites || !rewardsSummary) {
                      return []
                    }
                    const res = []
                    for (let i = 0; i < savedInvites.length; i += 1) {
                      const item = savedInvites[i]
                      let invitationReward = rewardsSummary.invitationsShare * 1
                      let missingInvitationReward = invitationReward

                      if (item.value === 'SavedInvite') {
                        missingInvitationReward *= 2 // not a winner => x2
                      }
                      if (item.value === 'SavedInviteWin') {
                        invitationReward *= 2 // winner => x2
                      }

                      for (let j = 0; j < item.count; j += 1) {
                        res.push({
                          epoch,
                          title: 'Saved invititation reward',
                          validationResult: '-',
                          invitationReward,
                          missingInvitationReward,
                          reason: 'Missed invitation',
                        })
                      }
                    }

                    return res
                  }

                  const getPreviousEpochSavedInvites = (
                    // eslint-disable-next-line no-shadow
                    epoch,
                    back,
                    // eslint-disable-next-line no-shadow
                    availableInvites,
                    // eslint-disable-next-line no-shadow
                    rewardedInvites,
                    // eslint-disable-next-line no-shadow
                    rewardsSummary
                  ) => {
                    if (!rewardedInvites || !availableInvites) {
                      return []
                    }
                    const available = availableInvites.find(
                      x => x.epoch === epoch - back
                    )
                    if (!available) {
                      return []
                    }
                    const activatedCount = rewardedInvites.filter(
                      x => x.epoch === epoch - back && x.activationHash
                    )
                    const res = []
                    for (
                      let i = 0;
                      i < available.invites - activatedCount;
                      i += 1
                    ) {
                      const invitationReward = 0
                      const missingInvitationReward =
                        rewardsSummary.invitationsShare * 3 ** (1 + back)

                      res.push({
                        epoch: epoch - back,
                        title: 'Saved invititation reward',
                        validationResult: '-',
                        invitationReward,
                        missingInvitationReward,
                        reason: 'Missed invitation',
                      })
                    }
                    return res
                  }

                  const invitationRewards = [
                    ...getRewardedData(
                      epochNumber - 1,
                      rewardsSummary,
                      rewardedInvites,
                      validationPenalty,
                      {state: identityStatus}
                    ),
                    ...getCurrentEpochSavedInvites(
                      epoch - 1,
                      savedInvites,
                      rewardsSummary
                    ),
                    ...getPreviousEpochSavedInvites(
                      epoch - 1,
                      1,
                      availableInvites,
                      rewardedInvites,
                      rewardsSummary
                    ),
                    ...getPreviousEpochSavedInvites(
                      epoch - 1,
                      2,
                      availableInvites,
                      rewardedInvites,
                      rewardsSummary
                    ),
                  ]

                  const missedInvitationReward = invitationRewards.reduce(
                    (prev, cur) => prev + cur.missingInvitationReward,
                    0
                  )

                  const reportRewardData = (
                    // eslint-disable-next-line no-shadow
                    reportRewards,
                    // eslint-disable-next-line no-shadow
                    rewardsSummary,
                    // eslint-disable-next-line no-shadow
                    validationPenalty,
                    // eslint-disable-next-line no-shadow
                    identity
                  ) => {
                    if (!reportRewards || !rewardsSummary || !identity) {
                      return []
                    }
                    return reportRewards.map(item => {
                      const reward = item.balance * 1 + item.stake * 1
                      let missingReward = 0
                      let details = '-'
                      if (!(reward && reward > 0)) {
                        missingReward = rewardsSummary.flipsShare / 5.0
                        if (validationPenalty) {
                          details = 'Validation penalty'
                        } else if (!isValidatedIdentity(identity)) {
                          details = 'My validation failed'
                        } else if (item.grade === 1) {
                          details = 'Flip with no reward'
                        } else {
                          details = 'Did not report'
                        }
                      }

                      return {
                        cid: item.cid,
                        author: item.author,
                        icon: item.icon,
                        reward,
                        missingReward,
                        details,
                        words: item.words,
                      }
                    })
                  }

                  const reportRewardsData = reportRewardData(
                    reportRewards,
                    rewardsSummary,
                    validationPenalty,
                    {state: identityStatus}
                  )

                  const missedReportReward = reportRewardsData.reduce(
                    (prev, cur) => prev + cur.missingReward,
                    0
                  )

                  const earningsScore =
                    earnings /
                    (earnings +
                      missedFlipReward +
                      missedValidationReward +
                      missedInvitationReward +
                      missedReportReward)

                  return {
                    ...context,
                    earnings,
                    earningsScore,
                  }
                }

                return {
                  ...context,
                  earnings: 0,
                  earningsScore: 0.02,
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
      send('FETCH', {epochNumber: epoch?.epoch - 1, identity})
  }, [epoch, identity, send])

  return {
    ...current.context,
    score,
    isLoading: current.matches('fetching'),
  }
}
