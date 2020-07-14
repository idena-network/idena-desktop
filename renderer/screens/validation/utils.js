import {State} from 'xstate'
import dayjs, {isDayjs} from 'dayjs'
import {
  persistState,
  loadPersistentState,
  loadPersistentStateValue,
} from '../../shared/utils/persist'
import {EpochPeriod} from '../../shared/types'
import {canValidate} from '../../shared/providers/identity-context'

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

export const solvableFlips = ({decoded}) => decoded
/**
 * Fully fetched and decoded flips
 * @param {*} flips
 */
export function filterSolvableFlips(flips) {
  return flips.filter(solvableFlips)
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
  const flippedFlips = []
  for (let i = 0; i < flips.length; i += 1) {
    const {fetched, decoded, failed, extra, flipped} = flips[i]
    if (extra) {
      extras.push(flips[i])
    } else if (flipped) {
      flippedFlips.push(flips[i])
    } else if (decoded) {
      solvable.push(flips[i])
    } else if (failed || fetched) {
      invalid.push(flips[i])
    } else {
      loading.push(flips[i])
    }
  }
  solvable.sort((a, b) => a.retries - b.retries)
  return [...solvable, ...flippedFlips, ...loading, ...invalid, ...extras]
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

export function persistValidationState(state) {
  persistState('validation2', state)
}

export function loadValidationStateDefinition() {
  return loadPersistentState('validation2')
}

export function loadValidationState() {
  const stateDef = loadValidationStateDefinition()
  return stateDef && State.create(stateDef)
}

export function clearValidationState() {
  persistState('validation2', null)
}

// Here below some guides that just make sense
// You can start validation in any case tho, but it just guarantees 100% failure
//
// Options:
// - Epoch is not fetched or failed, do NOTHING
// - Epoch is fetched but is NOT SHORT SESSION, do NOTHING
// - Epoch is fetched AND is SHORT SESSION BUT NOT VALID IDENTITY do NOTHING
// - Epoch is fetched AND is SHORT SESSION AND IDENTITY IS VALID go further
//
// TODO: add tests you cowards 👊
export function shouldStartValidation(epoch, identity) {
  const isValidationRunning =
    epoch &&
    [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
      epoch.currentPeriod
    )

  if (isValidationRunning && canValidate(identity)) {
    // Hooray! We're in but still need to check against persisted validation state and epoch
    const validationStateDefinition = loadValidationStateDefinition()
    if (validationStateDefinition) {
      const persistedValidationState = State.create(validationStateDefinition)
      const isDone = persistedValidationState.done // is it DONE? any positive or negative, validation-wise

      // One possible way to break this kinda magic case is stucking with node version before the fork
      if (epoch.epoch >= persistedValidationState.context.epoch) {
        const isSameEpoch =
          epoch.epoch === persistedValidationState.context.epoch // is it still SAME epoch?

        if (!isSameEpoch) {
          clearValidationState()
        }
        return !isDone || !isSameEpoch

        // Below cases simplified
        //
        // DONE but NOT SAME EPOCH
        // Validation started in next epoch
        // if (isDone && !isSameEpoch) return true

        // DONE and SAME EPOCH
        // We're done! Keep calm and wait for results
        // if (isDone && isSameEpoch) return false

        // NOT DONE and NOT SAME EPOCH
        // Not finised prev validation. Even more, still in the middle of PREV validation! Not sure it makes sense to proceed, clearing
        // if (!isDone && !isSameEpoch) return true

        // NOT DONE and SAME EPOCH
        // Just bumping persisted state, let's say after restarting the app
        // if (!isDone && isSameEpoch) return true
      }
    } else {
      // Don't have any persisted state, typically means fresh user = 1st validation
      return true
    }
  } else return false
}

export function didValidate(currentEpoch) {
  const validationStateDefinition = loadValidationStateDefinition()

  if (validationStateDefinition) {
    const {epoch} = State.create(validationStateDefinition).context
    return currentEpoch > epoch
  }

  return false
}

export function shouldExpectValidationResults(epoch) {
  const validationStateDefinition = loadValidationStateDefinition()

  if (validationStateDefinition) {
    const {
      done,
      context: {epoch: validationEpoch},
    } = State.create(validationStateDefinition)
    return done && epoch - validationEpoch === 1
  }

  return false
}

export function hasPersistedValidationResults(epoch) {
  return !!loadPersistentStateValue('validationResults', epoch)
}

export function shouldTranslate(translations, flip) {
  if (!flip) return false

  const {words} = flip

  return !!(
    words &&
    words.length &&
    !words
      .map(({id}) => translations[id])
      .reduce((acc, curr) => !!curr && acc, true)
  )
}

export function shouldPollLongFlips(
  flips,
  {validationStart, shortSessionDuration}
) {
  return (
    flips.some(({ready}) => !ready) &&
    dayjs().isBefore(
      (isDayjs(validationStart) ? validationStart : dayjs(validationStart))
        .add(shortSessionDuration, 's')
        .add(2, 'minute')
    )
  )
}

export const decodedWithKeywords = ({decoded, words}) =>
  decoded && words?.length > 0

export function availableReportsNumber(flips) {
  return Math.floor(flips.length / 3)
}
