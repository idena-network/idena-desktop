import {useMachine} from '@xstate/react'
import React from 'react'
import {Machine} from 'xstate'
import {OnboardingStep} from '../types'
import {
  onboardingStep,
  shouldTransitionToCreateFlipsStep,
} from '../utils/onboarding'
import {useChainState} from './chain-context'
import {useEpochState} from './epoch-context'
import {canValidate, useIdentityState} from './identity-context'

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
                300: next,
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
                cond: (_, {identity: {canActivateInvite}}) => canActivateInvite,
              },
              {
                target: onboardingStepSelector(OnboardingStep.Validate),
                // eslint-disable-next-line no-shadow
                cond: (_, {identity}) => canValidate(identity),
              },
              {
                target: onboardingStepSelector(OnboardingStep.ActivateMining),
                cond: (_, {identity: {age, online}}) => age === 1 && !online,
              },
              {
                target: onboardingStepSelector(OnboardingStep.CreateFlips),
                // eslint-disable-next-line no-shadow
                cond: (_, {identity}) =>
                  shouldTransitionToCreateFlipsStep(identity),
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
              next: onboardingStepSelector(OnboardingStep.Validate),
            }),
            ...createStep({
              current: OnboardingStep.Validate,
              next: onboardingStepSelector(OnboardingStep.ActivateMining),
            }),
            ...createStep({
              current: OnboardingStep.ActivateMining,
              next: onboardingStepSelector(OnboardingStep.CreateFlips),
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
      logger: global.isDev
        ? console.log
        : (...args) => global.logger.debug(...args),
    }
  )

  React.useEffect(() => {
    if (epoch >= 0 && identity && !syncing && !offline) {
      send('START', {identity})
    }
  }, [epoch, identity, offline, send, syncing])

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
          finish: React.useCallback(() => {
            send('FINISH')
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
