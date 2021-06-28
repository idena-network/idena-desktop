import {useMachine} from '@xstate/react'
import React from 'react'
import {Machine} from 'xstate'
import {IdentityStatus, OnboardingStep} from '../types'
import {
  loadOnboardingState,
  onboardingStep,
  persistOnboardingState,
} from '../utils/onboarding'
import {useChainState} from './chain-context'
import {useEpochState} from './epoch-context'
import {useIdentityState} from './identity-context'

const OnboardingStateContext = React.createContext()
const OnboardingDispatchContext = React.createContext()

export function OnboardingProvider(props) {
  const {syncing, offline} = useChainState()

  const {epoch} = useEpochState() ?? {epoch: -1}

  const identity = useIdentityState()

  const onboardingStepSelector = step => `#onboarding.${onboardingStep(step)}`

  // eslint-disable-next-line no-shadow
  const createStep = ({current, next}) => ({
    [current]: {
      initial: 'active',
      states: {
        active: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                SHOW: 'showing',
              },
            },
            showing: {},
          },
          on: {
            DISMISS: 'dismissed',
          },
        },
        done: {
          initial: 'salut',
          states: {
            salut: {
              after: {
                300: 'done',
              },
            },
            done: {
              after: {
                300: next.startsWith('#') ? next : onboardingStepSelector(next),
              },
            },
          },
        },
        dismissed: {
          on: {
            SHOW: 'active.showing',
          },
        },
      },
      on: {
        DONE: '.done',
        NEXT: next,
      },
    },
  })

  const [current, send] = useMachine(
    Machine({
      id: 'onboarding',
      context: {
        currentStep: OnboardingStep.ActivateInvite,
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: [
              {
                target: onboardingStepSelector(OnboardingStep.ActivateInvite),
                cond: (_, {identity: {state}}) =>
                  [IdentityStatus.Undefined, IdentityStatus.Invite].includes(
                    state
                  ),
              },
              {
                target: onboardingStepSelector(OnboardingStep.Validate),
                cond: (_, {identity: {state}}) =>
                  [IdentityStatus.Candidate, IdentityStatus.Zombie].includes(
                    state
                  ),
              },
              {
                target: onboardingStepSelector(OnboardingStep.ActivateMining),
                cond: (_, {identity: {isValidated, online}}) =>
                  isValidated && !online,
              },
              {
                target: onboardingStepSelector(OnboardingStep.CreateFlips),
                cond: (_, {identity: {online, flips, requiredFlips}}) =>
                  online && requiredFlips - (flips ?? []).length > 0,
              },
            ],
          },
        },
        onboarding: {
          initial: 'unknown',
          states: {
            unknown: {},
            ...createStep({
              current: OnboardingStep.ActivateInvite,
              next: OnboardingStep.Validate,
            }),
            ...createStep({
              current: OnboardingStep.Validate,
              next: OnboardingStep.ActivateMining,
            }),
            ...createStep({
              current: OnboardingStep.ActivateMining,
              next: OnboardingStep.CreateFlips,
            }),
            ...createStep({
              current: OnboardingStep.CreateFlips,
              next: '#onboarding.done',
            }),
          },
          on: {
            FINISH: 'done',
          },
        },
        done: {},
      },
    }),
    {
      state: loadOnboardingState(),
      logger: global.isDev
        ? console.log
        : (...args) => global.logger.debug(...args),
    }
  )

  React.useEffect(() => {
    if (epoch > 0 && identity && !syncing && !offline) send('START', {identity})
  }, [epoch, identity, offline, send, syncing])

  React.useEffect(() => {
    if (current.changed) persistOnboardingState(current)
  }, [current])

  return (
    <OnboardingStateContext.Provider value={current}>
      <OnboardingDispatchContext.Provider
        value={{
          showCurrentTask() {
            send('SHOW')
          },
          dismiss() {
            send('DISMISS')
          },
          done: React.useCallback(() => {
            send('DONE')
          }, [send]),
        }}
        {...props}
      />
    </OnboardingStateContext.Provider>
  )
}

export function useOnboardingState() {
  const context = React.useContext(OnboardingStateContext)
  if (context === undefined) {
    throw new Error(
      'useOnboardingState must be used within a OnboardingProvider'
    )
  }
  return context
}

export function useOnboardingDispatch() {
  const context = React.useContext(OnboardingDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useOnboardingDispatch must be used within a OnboardingDispatchContext'
    )
  }
  return context
}

export function useOnboarding() {
  return [useOnboardingState(), useOnboardingDispatch()]
}
