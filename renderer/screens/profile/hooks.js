import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useMutation, useQuery} from 'react-query'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  calculateInvitationRewardRatio,
  callRpc,
  toPercent,
} from '../../shared/utils/utils'
import {IdentityStatus, TxType} from '../../shared/types'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useChainState} from '../../shared/providers/chain-context'
import {apiUrl} from '../../shared/api/api-client'

export function useIdenaBot() {
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    global.ipcRenderer
      .invoke('get-data', 'idena-bot')
      .then(data => {
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
    submit: mutation.mutate,
  }
}

export function useStakingAlert() {
  const {t} = useTranslation()

  const {state, age} = useIdentityState()

  const calculateStakeLoss = useCalculateStakeLoss()

  return React.useMemo(() => {
    if ([IdentityStatus.Candidate, IdentityStatus.Newbie].includes(state)) {
      return t(
        'You will lose 100% of the stake if you fail or miss the upcoming validation.'
      )
    }

    if (state === IdentityStatus.Verified) {
      return t(
        'You will lose 100% of the stake if you fail the upcoming validation.'
      )
    }

    if (state === IdentityStatus.Zombie) {
      return age >= 10
        ? t(
            'You will lose 100% of the Stake if you miss the upcoming validation.'
          )
        : [
            t(
              `You will lose {{ratio}} of the stake if you fail the upcoming validation.`,
              {
                ratio: toPercent(calculateStakeLoss(age)),
              }
            ),
            t(
              'You will lose 100% of the stake if you miss the upcoming validation.'
            ),
          ]
    }

    if (state === IdentityStatus.Suspended && age < 10) {
      return t(
        'You will lose {{ratio}} of the stake if you fail the upcoming validation.',
        {
          ratio: toPercent(calculateStakeLoss(age)),
        }
      )
    }

    return null
  }, [state, age, t, calculateStakeLoss])
}

export function useCalculateStakeLoss() {
  return React.useCallback(
    age => Math.max(age === 4 ? 1 : (10 - age) / 100, 0),
    []
  )
}

export function useStakingApy() {
  const {stake} = useIdentityState()

  const epoch = useEpochState()

  const fetcher = React.useCallback(async ({queryKey}) => {
    const {result, error} = await (
      await fetch(apiUrl(queryKey.join('/').toLowerCase()))
    ).json()

    if (error) throw new Error(error.message)

    return result
  }, [])

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
    queryKey: ['epoch', epoch?.epoch - 1],
    queryFn: fetcher,
    staleTime: Infinity,
    enabled: Boolean(epoch),
    notifyOnChangeProps: 'tracked',
  })

  return React.useMemo(() => {
    if (stakingData && onlineMinersCount && prevEpochData) {
      const {averageMinerWeight} = stakingData

      const myStakeWeight = stake ** 0.9

      const proposerOnlyReward =
        (6 * myStakeWeight * 20) /
        (myStakeWeight * 20 + averageMinerWeight * 100)

      const committeeOnlyReward =
        (6 * myStakeWeight) / (myStakeWeight + averageMinerWeight * 199)

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

      const estimatedReward =
        85000 *
        (proposerProbability * proposerOnlyReward +
          committeeOnlyProbability * committeeOnlyReward +
          proposerAndCommitteeProbability * proposerAndCommitteeReward)

      const epy = estimatedReward / stake

      const epochDays = dayjs(epoch?.nextValidation).diff(
        prevEpochData?.validationTime,
        'day'
      )

      return (epy / Math.max(1, epochDays)) * 366
    }
  }, [epoch, onlineMinersCount, prevEpochData, stake, stakingData])
}

export function useInviteScore() {
  const {highestBlock} = useChainState()

  const epoch = useEpochState()

  const {canInvite} = useIdentityState()

  return React.useMemo(() => {
    const pendingInvites =
      global.invitesDb
        ?.getInvites()
        .filter(
          ({activated, terminatedHash, deletedAt}) =>
            !activated && !terminatedHash && !deletedAt
        ) ?? []

    const hasPendingInvites = canInvite || pendingInvites.length > 0

    if (epoch && highestBlock && hasPendingInvites) {
      return calculateInvitationRewardRatio(epoch, {highestBlock})
    }
  }, [canInvite, epoch, highestBlock])
}
