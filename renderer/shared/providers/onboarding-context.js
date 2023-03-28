/* eslint-disable react/prop-types */
import {useMachine} from '@xstate/react'
import React, {useMemo} from 'react'
import {createMachine} from 'xstate'
import {assign, choose} from 'xstate/lib/actions'
import {canValidate} from '../../screens/validation/utils'
import {IdentityStatus, OnboardingStep} from '../types'
import {requestDb} from '../utils/db'
import {rewardWithConfetti, shouldCreateFlips} from '../utils/onboarding'
import {useEpochState} from './epoch-context'
import {useIdentity} from './identity-context'

const OnboardingContext = React.createContext()

export function OnboardingProvider({children}) {
  const epoch = useEpochState()

  const [identity] = useIdentity()

  const createStep = (step, config) => ({
    [step]: {
      entry: ['setCurrentStep', 'setIdentity'],
      initial: 'unknown',
      states: {
        unknown: {
          on: {
            '': [
              {target: 'dismissed', cond: 'didDismissStep'},
              {target: 'promoting', cond: 'shouldPromoteStep'},
            ],
          },
          invoke: {
            src: 'restoreDismissedSteps',
            onDone: {actions: ['setDismissedSteps']},
            onError: 'promoting',
          },
        },
        promoting: {on: {SHOW: 'showing'}},
        showing: {on: {DISMISS: 'dismissed'}},
        dismissed: {
          entry: ['addDismissedStep', 'persistDismissedSteps'],
        },
      },
      ...config,
    },
  })

  const [current, send] = useMachine(
    createMachine(
      {
        context: {currentStep: null, dismissedSteps: null},
        initial: 'unknown',
        states: {
          unknown: {
            on: {
              [OnboardingStep.ActivateInvite]: OnboardingStep.ActivateInvite,
              [OnboardingStep.Validate]: OnboardingStep.Validate,
              [OnboardingStep.ActivateMining]: OnboardingStep.ActivateMining,
              [OnboardingStep.CreateFlips]: OnboardingStep.CreateFlips,
              UPDATE_IDENTITY: {actions: ['setIdentity']},
            },
          },
          ...createStep(OnboardingStep.ActivateInvite, {
            on: {
              [OnboardingStep.Validate]: OnboardingStep.Validate,
              SHOW: '.showing',
            },
            exit: ['reward'],
          }),
          ...createStep(OnboardingStep.Validate, {
            on: {
              [OnboardingStep.ActivateMining]: OnboardingStep.ActivateMining,
              SHOW: '.showing',
            },
            exit: [
              choose([
                {
                  actions: 'reward',
                  // eslint-disable-next-line no-shadow
                  cond: ({identity}) =>
                    identity.isValidated &&
                    identity.state === IdentityStatus.Newbie,
                },
              ]),
            ],
          }),
          ...createStep(OnboardingStep.ActivateMining, {
            on: {
              NEXT: [
                {
                  target: OnboardingStep.CreateFlips,
                  // eslint-disable-next-line no-shadow
                  cond: ({identity}) => shouldCreateFlips(identity),
                },
                'done',
              ],
              SHOW: '.showing',
              [OnboardingStep.CreateFlips]: OnboardingStep.CreateFlips,
            },
            exit: ['addDismissedStep', 'persistDismissedSteps'],
          }),
          ...createStep(OnboardingStep.CreateFlips),
          done: {},
        },
        on: {
          RESET: '.unknown',
        },
      },
      {
        actions: {
          setCurrentStep: assign({currentStep: (_, {type}) => type}),
          setDismissedSteps: assign({
            dismissedSteps: (_, {data}) => new Set(data),
          }),
          addDismissedStep: assign({
            dismissedSteps: ({dismissedSteps, currentStep}) =>
              dismissedSteps.add(currentStep),
          }),
          persistDismissedSteps: ({dismissedSteps}) =>
            global
              .sub(requestDb(), 'onboarding', {valueEncoding: 'json'})
              .put('onboardingDismissedSteps', [...dismissedSteps]),
          setIdentity: assign({
            // eslint-disable-next-line no-shadow
            identity: (_, {identity}) => identity,
          }),
          reward: () => rewardWithConfetti(),
        },
        services: {
          restoreDismissedSteps: async () => {
            try {
              return await global
                .sub(requestDb(), 'onboarding', {valueEncoding: 'json'})
                .get('onboardingDismissedSteps')
            } catch {
              return null
            }
          },
        },
        guards: {
          didDismissStep: ({dismissedSteps, currentStep}) =>
            dismissedSteps?.has(currentStep),
          shouldPromoteStep: ({dismissedSteps, currentStep}) =>
            Boolean(dismissedSteps) && !dismissedSteps.has(currentStep),
        },
      }
    )
  )

  React.useEffect(() => {
    if (identity.address) send('RESET')
  }, [identity.address, send])

  React.useEffect(() => {
    if (epoch?.epoch >= 0 && identity) {
      send(
        (() => {
          switch (true) {
            case identity.canActivateInvite:
              return OnboardingStep.ActivateInvite
            case identity.age === 1 &&
              !(identity.online || Boolean(identity.delegatee)):
              return OnboardingStep.ActivateMining
            case shouldCreateFlips(identity):
              return OnboardingStep.CreateFlips
            case canValidate(identity):
              return OnboardingStep.Validate
            default:
              return 'UPDATE_IDENTITY'
          }
        })(),
        {identity}
      )
    }
  }, [epoch, identity, send])

  return (
    <OnboardingContext.Provider
      value={useMemo(
        () => [
          current,
          {
            showCurrentTask() {
              send('SHOW')
            },
            dismissCurrentTask() {
              send('DISMISS')
            },
            next() {
              send('NEXT')
            },
          },
        ],
        [current, send]
      )}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (context === undefined)
    throw new Error('useOnboarding must be used within a OnboardingProvider')
  return context
}
