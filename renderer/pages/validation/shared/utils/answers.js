export const types = {
  none: 0,
  left: 1,
  right: 2,
  inappropriate: 3,
}

export function answered(answer) {
  return Number.isFinite(answer)
}

export function appropriate(answer) {
  return answered(answer) && answer !== types.inappropriate
}

// Answers that are abusive, inappropriate or spam.
export function inappropriate(answer) {
  return answered(answer) && answer === types.inappropriate
}
