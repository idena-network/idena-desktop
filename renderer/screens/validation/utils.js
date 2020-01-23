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

const validFlip = ({ready, fetched, decoded}) => ready && fetched && decoded
/**
 * Fully fetched and decoded flips
 * @param {*} flips
 */
export function filterValidFlips(flips) {
  return flips.filter(validFlip)
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
  return flips
}

export function flipExtraFlip({extra, ...flip}) {
  return {...flip, extra: !extra}
}
