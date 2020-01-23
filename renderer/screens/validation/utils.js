// NOTE: decoded === readyToSolve

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

/**
 * Available for fetching flips
 * @param {*} flips
 */
export function filterAvailableForFetching(flips) {
  return flips.filter(({ready, extra}) => ready && !extra)
}

/**
 * Waiting for fetching flips
 * @param {*} flips
 */
export function filterWaitingForFetching(flips) {
  return flips.filter(({ready, fetched}) => ready && !fetched)
}

/**
 * Waiting for decoding flips
 * @param {*} flips
 */
export function filterWaitingForDecoding(flips) {
  return flips.filter(
    ({ready, fetched, decoded}) => ready && fetched && !decoded
  )
}

/**
 * Fully fetched and decoded flips
 * @param {*} flips
 */
export function filterSolvableFlips(flips) {
  return flips.filter(({decoded}) => decoded)
}

export function everyFlipFetched(flips = []) {
  return flips.length && flips.every(({ready, fetched}) => ready && fetched)
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
  return [...solvable, ...loading, ...invalid, ...extras]
}

export function flipExtraFlip({extra, ...flip}) {
  return {...flip, extra: !extra}
}
