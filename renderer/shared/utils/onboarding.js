import {State} from 'xstate'
import {loadPersistentState, persistState} from './persist'

export const activeOnboardingStep = step => `onboarding.${step}.active`
export const activeIdleOnboardingStep = step =>
  `${activeOnboardingStep(step)}.idle`
export const activeShowingOnboardingStep = step =>
  `${activeOnboardingStep(step)}.showing`

export const doneOnboardingStep = step => `onboarding.${step}.done`

export function loadOnboardingState() {
  const stateDefinition = loadPersistentState('onboarding')
  return stateDefinition && State.create(stateDefinition)
}

export function persistOnboardingState(state) {
  return persistState('onboarding', state)
}
