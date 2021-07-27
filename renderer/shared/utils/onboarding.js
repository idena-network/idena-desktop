import confetti from 'canvas-confetti'

export const onboardingPromotingStep = step => `${step}.promoting`
export const onboardingShowingStep = step => `${step}.showing`

export const shouldCreateFlips = ({isValidated, requiredFlips, flips}) =>
  isValidated && requiredFlips - (flips ?? []).length > 0

export function rewardWithConfetti(params) {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: {y: 0.6},
    ...params,
  })
}
