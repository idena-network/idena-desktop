import {eitherState} from './utils'

export const onboardingStep = step => `onboarding.${step}`

export const activeOnboardingStep = step => `onboarding.${step}.active`
export const activeIdleOnboardingStep = step =>
  `${activeOnboardingStep(step)}.idle`
export const activeShowingOnboardingStep = step =>
  `${activeOnboardingStep(step)}.showing`

export const doneOnboardingStep = step => `onboarding.${step}.done`

export const shouldCompleteOnboardingStep = (currentOnboarding, step) =>
  eitherState(currentOnboarding, onboardingStep(step)) &&
  !eitherState(currentOnboarding, 'idle', `${doneOnboardingStep(step)}.done`)

export const shouldTransitionToCreateFlipsStep = ({
  isValidated,
  requiredFlips,
  flips,
}) => isValidated && requiredFlips - (flips ?? []).length > 0
