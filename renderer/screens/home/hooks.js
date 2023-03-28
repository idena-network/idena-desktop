import React, {useEffect, useState} from 'react'
import dayjs from 'dayjs'
import {useMutation, useQuery} from 'react-query'
import {useIdentityState} from '../../shared/providers/identity-context'
import {calculateInvitationRewardRatio, callRpc} from '../../shared/utils/utils'
import {IdentityStatus, TxType} from '../../shared/types'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useChainState} from '../../shared/providers/chain-context'
import {apiUrl} from '../../shared/api/api-client'
import {useRpcFetcher} from '../ads/hooks'

export function useIdenaBot() {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    global.ipcRenderer
      .invoke('get-data', 'idena-bot')
      .then((data) => {
        setConnected(
          data || JSON.parse(localStorage.getItem('connectIdenaBot')) || false
        )
      })
      .catch(() => {})
  }, [])

  return [
    connected,
    {
      persist: () => {
        localStorage.setItem('connectIdenaBot', true)
        setConnected(true)
      },
      skip: () => {
        global.ipcRenderer.send('set-data', 'idena-bot', true)
        setConnected(true)
      },
    },
  ]
}

export function useReplenishStake({onSuccess, onError}) {
  const {address} = useIdentityState()

  const mutation = useMutation(
    async ({amount}) =>
      callRpc('dna_sendTransaction', {
        type: TxType.ReplenishStakeTx,
        from: address,
        to: address,
        amount,
      }),
    {
      onSuccess,
      onError,
    }
  )

  return {
    data: mutation.data,
    submit: mutation.mutate,
  }
}

export function useStakingApy() {
  const {stake, invites, invitees, state} = useIdentityState()

  const epoch = useEpochState()

  const fetcher = React.useCallback(async ({queryKey}) => {
    const {result, error} = await (
      await fetch(apiUrl(queryKey.join('/').toLowerCase()))
    ).json()

    if (error) throw new Error(error.message)

    return result
  }, [])

  const rpcFetcher = useRpcFetcher()

  const {data: stakingData} = useQuery({
    queryKey: ['staking'],
    queryFn: fetcher,
    notifyOnChangeProps: 'tracked',
  })

  const {data: onlineMinersCount} = useQuery({
    queryKey: ['onlineminers', 'count'],
    queryFn: fetcher,
    notifyOnChangeProps: 'tracked',
  })

  const {data: prevEpochData} = useQuery({
    // eslint-disable-next-line no-unsafe-optional-chaining
    queryKey: ['epoch', epoch?.epoch - 1],
    queryFn: fetcher,
    staleTime: Infinity,
    enabled: Boolean(epoch),
    notifyOnChangeProps: 'tracked',
  })

  const {data: validationRewardsSummaryData} = useQuery({
    // eslint-disable-next-line no-unsafe-optional-chaining
    queryKey: ['epoch', epoch?.epoch - 1, 'rewardsSummary'],
    queryFn: fetcher,
    enabled: Boolean(epoch),
    staleTime: Infinity,
    notifyOnChangeProps: 'tracked',
  })

  const lastInvitee = invitees && invitees.reverse()[0].TxHash
  const secondToLastInvitee =
    invitees && invitees.length > 1 && invitees.reverse()[1].TxHash
  const maxInvitesCount =
    // eslint-disable-next-line no-nested-ternary
    state === IdentityStatus.Human
      ? 2
      : state === IdentityStatus.Verified
      ? 1
      : 0

  const {data: lastInviteTx} = useQuery({
    queryKey: ['bcn_transaction', [lastInvitee]],
    queryFn: rpcFetcher,
    enabled: maxInvitesCount - invites > 0 && Boolean(lastInvitee),
    staleTime: Infinity,
    notifyOnChangeProps: 'tracked',
  })

  const {data: secondToLastInviteTx} = useQuery({
    queryKey: ['bcn_transaction', [secondToLastInvitee]],
    queryFn: rpcFetcher,
    enabled: maxInvitesCount - invites > 1 && Boolean(secondToLastInvitee),
    staleTime: Infinity,
    notifyOnChangeProps: 'tracked',
  })

  return React.useMemo(() => {
    if (
      stakingData &&
      onlineMinersCount &&
      prevEpochData &&
      validationRewardsSummaryData
    ) {
      const {weight, averageMinerWeight, extraFlipsWeight, invitationsWeight} =
        stakingData
      const {validation, staking, extraFlips, invitations} =
        validationRewardsSummaryData

      // epoch staking
      const epochStakingRewardFund = Number(staking) || 0.9 * Number(validation)
      const epochReward = (stake ** 0.9 / weight) * epochStakingRewardFund

      const myStakeWeight = stake ** 0.9

      // available extra flips count
      const extraFlipsCount =
        // eslint-disable-next-line no-nested-ternary
        state === IdentityStatus.Human
          ? 2
          : state === IdentityStatus.Verified
          ? 1
          : 0
      const extraFlipsReward =
        extraFlipsCount * (myStakeWeight / extraFlipsWeight) * extraFlips

      // available invites count
      let invitesCount = invites
      const hasMoreInvites =
        (state === IdentityStatus.Human && invitesCount < 2) ||
        (state === IdentityStatus.Verified && invitesCount < 1)
      if (
        hasMoreInvites &&
        lastInviteTx &&
        lastInviteTx.epoch === epoch?.epoch
      ) {
        // eslint-disable-next-line no-plusplus
        invitesCount++
        if (
          hasMoreInvites &&
          secondToLastInviteTx &&
          secondToLastInviteTx.epoch === epoch?.epoch
        ) {
          // eslint-disable-next-line no-plusplus
          invitesCount++
        }
      }
      const invitationReward =
        invitesCount * ((myStakeWeight / invitationsWeight) * invitations)

      const proposerOnlyReward =
        (6 * myStakeWeight * 20) /
        (myStakeWeight * 20 + averageMinerWeight * 100)

      const committeeOnlyReward =
        (6 * myStakeWeight) / (myStakeWeight + averageMinerWeight * 119)

      const proposerAndCommitteeReward =
        (6 * myStakeWeight * 21) /
        (myStakeWeight * 21 + averageMinerWeight * 99)

      const proposerProbability = 1 / onlineMinersCount

      const committeeProbability =
        Math.min(100, onlineMinersCount) / onlineMinersCount

      const proposerOnlyProbability =
        proposerProbability * (1 - committeeProbability)

      const committeeOnlyProbability =
        committeeProbability * (1 - proposerProbability)

      const proposerAndCommitteeProbability =
        proposerOnlyProbability * committeeOnlyProbability

      const epochDays = dayjs(epoch?.nextValidation).diff(
        prevEpochData?.validationTime,
        'day'
      )

      const estimatedReward =
        ((85000 * epochDays) / 21.0) *
        (proposerOnlyProbability * proposerOnlyReward +
          committeeOnlyProbability * committeeOnlyReward +
          proposerAndCommitteeProbability * proposerAndCommitteeReward)

      const epy =
        (estimatedReward + epochReward + extraFlipsReward + invitationReward) /
        stake

      return (epy / Math.max(1, epochDays)) * 366
    }
  }, [
    epoch,
    invites,
    lastInviteTx,
    onlineMinersCount,
    prevEpochData,
    secondToLastInviteTx,
    stake,
    stakingData,
    state,
    validationRewardsSummaryData,
  ])
}

export function useInviteScore() {
  const {highestBlock} = useChainState()

  const epoch = useEpochState()

  const {canInvite, invitees} = useIdentityState()

  const inviteesAddresses = (invitees || []).map((x) => x.Address)

  const {data: hasNotActivatedInvite} = useQuery({
    queryKey: ['invitesStatuses', ...inviteesAddresses],
    queryFn: () =>
      Promise.all(
        inviteesAddresses.map((addr) => callRpc('dna_identity', addr))
      ),
    select: React.useCallback(
      (data) => data.some((x) => x.state === IdentityStatus.Invite),
      []
    ),
  })

  return React.useMemo(() => {
    if (epoch && highestBlock && (canInvite || hasNotActivatedInvite)) {
      return calculateInvitationRewardRatio(epoch, {highestBlock})
    }
  }, [canInvite, epoch, hasNotActivatedInvite, highestBlock])
}
