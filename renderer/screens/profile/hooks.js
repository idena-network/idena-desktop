import React from 'react'
import {useMachine} from '@xstate/react'
import {assign, createMachine} from 'xstate'
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
import {apiUrl} from '../oracles/utils'
import {useChainState} from '../../shared/providers/chain-context'

export function useIdenaBot() {
  const [current, send] = useMachine(
    createMachine({
      context: {
        connected: undefined,
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: 'loadConnectionStatus',
          },
          on: {
            CONNECTED: 'connected',
            DISCONNECTED: 'disconnected',
          },
        },
        connected: {
          entry: [assign({connected: true}), 'persist'],
        },
        disconnected: {
          on: {CONNECT: 'connected'},
        },
      },
    }),
    {
      services: {
        loadConnectionStatus: () => cb => {
          try {
            cb(
              JSON.parse(localStorage.getItem('connectIdenaBot'))
                ? 'CONNECTED'
                : 'DISCONNECTED'
            )
          } catch (e) {
            console.error(e)
            cb('DISCONNECTED')
          }
        },
      },
      actions: {
        persist: ({connected}) => {
          localStorage.setItem('connectIdenaBot', connected)
        },
      },
    }
  )

  return [current.context.connected, () => send('CONNECT')]
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

  const {data: validationRewardsSummaryData} = useQuery({
    queryKey: ['epoch', epoch?.epoch - 1, 'rewardsSummary'],
    queryFn: fetcher,
    enabled: Boolean(epoch),
    staleTime: Infinity,
    notifyOnChangeProps: 'tracked',
  })

  const {data: prevEpochData} = useQuery({
    queryKey: ['epoch', epoch?.epoch - 1],
    queryFn: fetcher,
    staleTime: Infinity,
    notifyOnChangeProps: 'tracked',
  })

  return React.useMemo(() => {
    if (stakingData && validationRewardsSummaryData && epoch && prevEpochData) {
      const {weight} = stakingData
      const {validation, staking} = validationRewardsSummaryData

      const epochStakingRewardFund = Number(staking) || 0.9 * Number(validation)

      const epochReward = (stake ** 0.9 / weight) * epochStakingRewardFund

      const epy = epochReward / stake

      const epochDays = dayjs(epoch?.nextValidation).diff(
        prevEpochData?.validationTime,
        'day'
      )

      return (epy / epochDays) * 366
    }
  }, [epoch, prevEpochData, stake, stakingData, validationRewardsSummaryData])
}

export function useInvitationRewardRatio() {
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

export function useInvitationRewardRatioProps() {
  const invitationRewardRatio = useInvitationRewardRatio()

  return React.useMemo(() => {
    const bg = {
      low: 'red.010',
      mid: 'orange.010',
      high: 'green.010',
    }

    const color = {
      low: 'red.500',
      mid: 'orange.500',
      high: 'green.500',
    }

    const level =
      // eslint-disable-next-line no-nested-ternary
      invitationRewardRatio < 0.75
        ? 'low'
        : invitationRewardRatio < 0.99
        ? 'mid'
        : 'high'

    return {
      bg: bg[level],
      color: color[level],
    }
  }, [invitationRewardRatio])
}
