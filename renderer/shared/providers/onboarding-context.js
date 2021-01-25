import {useMachine} from '@xstate/react'
import React from 'react'
import {Machine} from 'xstate'
import {log} from 'xstate/lib/actions'
import {IdentityStatus, OnboardingStep} from '../types'
import {useChainState} from './chain-context'
import {useEpochState} from './epoch-context'
import {useIdentityState} from './identity-context'

const OnboardingStateContext = React.createContext()
const OnboardingDispatchContext = React.createContext()

export function OnboardingProvider(props) {
  const {syncing} = useChainState()
  const {epoch} = useEpochState() ?? {epoch: -1}
  const {state} = useIdentityState()

  // eslint-disable-next-line no-shadow
  const createStep = ({current, next}) => ({
    [current]: {
      initial: 'active',
      states: {
        active: {
          initial: 'idle',
          states: {
            idle: {
              on: {SHOW: {target: 'showing', actions: [log()]}},
            },
            showing: {},
          },
          on: {
            DISMISS: 'dismissed',
            DONE: 'done',
          },
        },
        done: {},
        dismissed: {
          SHOW: 'active',
        },
      },
      on: {
        NEXT: next,
      },
    },
  })

  const [current, send] = useMachine(
    Machine(
      {
        id: 'onboarding',
        context: {
          currentStep: OnboardingStep.ActivateInvite,
        },
        initial: 'idle',
        states: {
          idle: {
            on: {
              START: 'onboarding',
            },
          },
          onboarding: {
            initial: OnboardingStep.ActivateInvite,
            states: {
              ...createStep({
                current: OnboardingStep.ActivateInvite,
                next: OnboardingStep.Validate,
              }),
              ...createStep({
                current: OnboardingStep.Validate,
                next: OnboardingStep.FlipLottery,
              }),
              ...createStep({
                current: OnboardingStep.FlipLottery,
                next: OnboardingStep.WaitingValidationResults,
              }),
              ...createStep({
                current: OnboardingStep.WaitingValidationResults,
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
      },
      {
        services: {},
        actions: {},
      }
    )
  )

  React.useEffect(() => {
    if (
      epoch > 0 &&
      !syncing &&
      [IdentityStatus.Undefined, IdentityStatus.Invite].includes(state)
    )
      send('START')
  }, [epoch, send, state, syncing])

  return (
    <OnboardingStateContext.Provider value={current}>
      <OnboardingDispatchContext.Provider
        value={{
          showCurrentTask() {
            send('SHOW')
          },
          dismissCurrentStep() {
            send('DISMISS')
          },
          finishOnboarding() {
            send('DONE')
          },
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

export const idleOnboardingStep = step => `onboarding.${step}.active.idle`
export const showingOnboardingStep = step => `onboarding.${step}.active.showing`
