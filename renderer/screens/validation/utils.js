/**
 * Ready to be fetched flips, including extra
 * @param {*} flips
 */
export function filterReadyFlips(flips) {
  return flips.filter(({ready}) => ready)
}

/**
 * All regular, not extra, flips regardless of it readiness
 * @param {*} flips
 */
export function filterRegularFlips(flips) {
  return flips.filter(({extra}) => !extra)
}

export const readyNotFetched = ({ready, fetched}) => ready && !fetched

/**
 * Fully fetched and decoded flips
 * @param {*} flips
 */
export function filterSolvableFlips(flips) {
  return flips.filter(({decoded}) => decoded)
}

/**
 * Flips failed to fetch or decode for some reason
 * @param {*} flips
 */
export function failedFlips(flips = []) {
  // Hmm, do we need to bump extra flip if it's ready but failed to fetch
  return flips.filter(
    ({ready, decoded, extra}) =>
      (!ready && !extra) || (ready && !extra && !decoded)
  )
}

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
  return {...flip, extra: !extra}
}
