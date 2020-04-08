export const readyFlip = ({ready}) => ready

/**
 * Ready to be fetched flips, including extra
 * @param {*} flips
 */
export function filterReadyFlips(flips) {
  return flips.filter(readyFlip)
}

/**
 * All regular, not extra, flips regardless of it readiness
 * @param {*} flips
 */
export function filterRegularFlips(flips) {
  return flips.filter(({extra}) => !extra)
}

export const readyNotFetchedFlip = ({ready, fetched}) => ready && !fetched

/**
 * Fully fetched and decoded flips
 * @param {*} flips
 */
export function filterSolvableFlips(flips) {
  return flips.filter(({decoded}) => decoded)
}

export const failedFlip = ({ready, decoded, extra}) =>
  !extra && (!ready || !decoded)

export const availableExtraFlip = ({extra, decoded}) => extra && decoded

export const missingFlip = ({ready, missing}) => ready && missing

export function rearrangeFlips(flips) {
  const solvable = []
  const loading = []
  const invalid = []
  const extras = []
  for (let i = 0; i < flips.length; i += 1) {
    const {fetched, decoded, failed, extra} = flips[i]
    if (extra) {
      extras.push(flips[i])
    } else if (decoded) {
      solvable.push(flips[i])
    } else if (failed || fetched) {
      invalid.push(flips[i])
    } else {
      loading.push(flips[i])
    }
  }
  solvable.sort((a, b) => a.retries - b.retries)
  return [...solvable, ...loading, ...invalid, ...extras]
}

export function flipExtraFlip({extra, ...flip}) {
  return {...flip, extra: !extra, flipped: true}
}

export function hasEnoughAnswers(flips) {
  const solvable = flips.filter(({decoded, extra}) => decoded && !extra)
  const answered = solvable.filter(({option}) => option)
  return solvable.length && answered.length / solvable.length >= 0.6
}

export function missingHashes(flips) {
  return flips.filter(missingFlip).map(({hash}) => hash)
}

export function exponentialBackoff(retry) {
  return Math.min(2 ** retry + Math.random(), 32)
}
