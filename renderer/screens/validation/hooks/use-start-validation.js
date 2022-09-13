import {useRouter} from 'next/router'
import React from 'react'
import {useInterval} from '../../../shared/hooks/use-interval'
import {useEpochState} from '../../../shared/providers/epoch-context'
import {useIdentity} from '../../../shared/providers/identity-context'
import {EpochPeriod} from '../../../shared/types'
import {canValidate, shouldStartValidation} from '../utils'

export function useAutoStartValidation() {
  const router = useRouter()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const isCandidate = React.useMemo(() => canValidate(identity), [identity])

  useInterval(
    () => {
      if (shouldStartValidation(epoch, identity)) {
        router.push('/validation')
      }
    },
    isCandidate ? 1000 : null
  )
}

export function useAutoStartLottery() {
  const router = useRouter()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const isCandidate = React.useMemo(() => canValidate(identity), [identity])

  useInterval(
    () => {
      if (epoch?.currentPeriod === EpochPeriod.FlipLottery) {
        router.push('/validation/lottery')
      }
    },
    isCandidate ? 1000 : null
  )
}
