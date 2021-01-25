import {useMachine} from '@xstate/react'
import React from 'react'
import {Machine} from 'xstate'
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
              [OnboardingStep.ActivateInvite]: {
                on: {
                  DONE: OnboardingStep.Validate,
                },
              },
              [OnboardingStep.Validate]: {
                on: {
                  DONE: OnboardingStep.FlipLottery,
                },
              },
              [OnboardingStep.FlipLottery]: {
                on: {
                  DONE: OnboardingStep.WaitingValidationResults,
                },
              },
              [OnboardingStep.WaitingValidationResults]: {
                on: {
                  DONE: OnboardingStep.CreateFlips,
                },
              },
              [OnboardingStep.CreateFlips]: {
                on: {
                  DONE: '#onboarding.done',
                },
              },
            },
            on: {
              DISMISS: 'done',
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
    <OnboardingStateContext.Provider value={current.context}>
      <OnboardingDispatchContext.Provider
        value={{
          resetLastVotingTimestamp() {
            send('RESET')
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
