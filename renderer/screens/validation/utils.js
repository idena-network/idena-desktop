import {State} from 'xstate'
import dayjs, {isDayjs} from 'dayjs'
import {
  persistState,
  loadPersistentState,
  loadPersistentStateValue,
} from '../../shared/utils/persist'
import {EpochPeriod, IdentityStatus} from '../../shared/types'

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
  persistState('validation2', {
    ...state,
    context: {
      ...state.context,
      reports: [...state.context.reports],
    },
  })
}

export function loadValidationStateDefinition() {
  return loadPersistentState('validation2')
}

export function loadValidationState() {
  const stateDef = loadValidationStateDefinition()

  if (stateDef) {
    const state = State.create(stateDef)

    let reports
    try {
      reports = Array.isArray(state.context.reports)
        ? new Set([...state.context.reports])
        : new Set()
    } catch {
      reports = new Set()
    }

    return {
      ...state,
      context: {
        ...state.context,
        reports,
      },
    }
  }
}

export function clearValidationState() {
  persistState('validation2', null)
}

export function shouldStartValidation(epoch, identity) {
  const isValidationRunning =
    epoch &&
    [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
      epoch.currentPeriod
    )

  if (isValidationRunning && canValidate(identity)) {
    const validationStateDefinition = loadValidationStateDefinition()
    if (validationStateDefinition) {
      const persistedValidationState = State.create(validationStateDefinition)
      const isDone = persistedValidationState.done

      const isSameEpoch = epoch.epoch === persistedValidationState.context.epoch

      if (!isSameEpoch) {
        clearValidationState()
      }

      return !isDone || !isSameEpoch
    }

    return true
  }

  return false
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

export function canValidate(identity) {
  if (!identity) {
    return false
  }

  const {requiredFlips, flips, state} = identity

  const numOfFlipsToSubmit = requiredFlips - (flips || []).length
  const shouldSendFlips = numOfFlipsToSubmit > 0

  return (
    ([
      IdentityStatus.Human,
      IdentityStatus.Verified,
      IdentityStatus.Newbie,
    ].includes(state) &&
      !shouldSendFlips) ||
    [
      IdentityStatus.Candidate,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
    ].includes(state)
  )
}
