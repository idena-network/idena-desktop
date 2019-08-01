/* eslint-disable no-use-before-define */
import React, {useReducer, useEffect, createContext, useContext} from 'react'
import {decode} from 'rlp'
import * as api from '../api/validation'
import {useEpochState, EpochPeriod} from './epoch-context'
import useFlips from '../utils/useFlips'
import {useValidationTimer} from '../hooks/use-validation'
import useLogger from '../hooks/use-logger'
import {fetchFlip} from '../api'

export const AnswerType = {
  None: 0,
  Left: 1,
  Right: 2,
  Inappropriate: 3,
}

export const SessionType = {
  Short: 'short',
  Long: 'long',
}

function fromHexString(hexString) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  )
}

function decodeFlips(hashes, hexes) {
  return hashes.map(({hash, ready}) => {
    const hex = hexes.find(x => x.hash === hash)
    if (hex) {
      try {
        const decodedFlip = decode(fromHexString(hex.hex.substring(2)))
        const orders = decodedFlip[1].map(order => order.map(x => x[0] || 0))
        return {
          hash,
          ready,
          pics: decodedFlip[0],
          orders,
          answer: null,
        }
      } catch {
        return {
          hash,
          ready: false,
          pics: null,
          orders: null,
          answer: null,
        }
      }
    }
    return {
      hash,
      ready,
      pics: null,
      orders: null,
      answer: null,
    }
  })
}

export function hasAnswer(answer) {
  return Number.isFinite(answer)
}

function canSubmit(flips, idx) {
  return flips.map(x => x.answer).every(hasAnswer) || idx === flips.length - 1
}

const LOAD_VALIDATION = 'LOAD_VALIDATION'
const SUBMIT_SHORT_ANSWERS = 'SUBMIT_SHORT_ANSWERS'
const SUBMIT_LONG_ANSWERS = 'SUBMIT_LONG_ANSWERS'
const RESET_EPOCH = 'RESET_EPOCH'
export const START_FETCH_FLIPS = 'START_FETCH_FLIPS'
const FETCH_FLIPS_SUCCEEDED = 'FETCH_FLIPS_SUCCEEDED'
const FETCH_FLIPS_FAILED = 'FETCH_FLIPS_FAILED'
export const ANSWER = 'ANSWER'
export const NEXT = 'NEXT'
export const PREV = 'PREV'
export const PICK = 'PICK'
export const REPORT_ABUSE = 'REPORT_ABUSE'

const initialCeremonyState = {
  hashes: [],
  flips: [],
  loading: true,
  currentIndex: 0,
  canSubmit: false,
  ready: false,
}

const initialState = {
  shortAnswers: [],
  longAnswers: [],
  epoch: null,
  shortAnswersSubmitted: false,
  longAnswersSubmitted: false,
  ...initialCeremonyState,
}

function validationReducer(state, action) {
  switch (action.type) {
    case LOAD_VALIDATION: {
      return {...state, ...action.validation}
    }
    case SUBMIT_SHORT_ANSWERS: {
      return {
        ...state,
        shortAnswers: action.answers,
        epoch: action.epoch,
        shortAnswersSubmitted: true,
        ...initialCeremonyState,
      }
    }
    case SUBMIT_LONG_ANSWERS: {
      return {
        ...state,
        longAnswers: action.answers,
        epoch: action.epoch,
        longAnswersSubmitted: true,
        ...initialCeremonyState,
      }
    }
    case RESET_EPOCH: {
      return {
        ...state,
        shortAnswers: [],
        longAnswers: [],
        epoch: action.epoch,
        shortAnswersSubmitted: false,
        longAnswersSubmitted: false,
        ...initialCeremonyState,
      }
    }
    case START_FETCH_FLIPS: {
      return {
        ...state,
        loading: true,
      }
    }
    case FETCH_FLIPS_SUCCEEDED: {
      const {hashes, hexes} = action
      const flips = decodeFlips(hashes, hexes)
      return {
        ...state,
        hashes,
        flips,
        loading: false,
        ready: hashes.every(x => x.ready),
      }
    }
    case FETCH_FLIPS_FAILED: {
      return {
        ...state,
        loading: true,
        error: action.error,
        ready: state.hashes.length === 0,
      }
    }
    case PREV: {
      const idx = Math.max(state.currentIndex - 1, 0)
      return {
        ...state,
        currentIndex: idx,
        canSubmit: canSubmit(state.flips, idx),
      }
    }
    case NEXT: {
      const idx = Math.min(state.currentIndex + 1, state.flips.length - 1)
      return {
        ...state,
        currentIndex: idx,
        canSubmit: canSubmit(state.flips, idx),
      }
    }
    case PICK: {
      return {
        ...state,
        currentIndex: action.index,
        canSubmit: canSubmit(state.flips, action.index),
      }
    }
    case ANSWER: {
      const flips = [
        ...state.flips.slice(0, state.currentIndex),
        {...state.flips[state.currentIndex], answer: action.option},
        ...state.flips.slice(state.currentIndex + 1),
      ]
      return {
        ...state,
        flips,
        canSubmit: canSubmit(flips, state.currentIndex),
      }
    }
    case REPORT_ABUSE: {
      const flips = [
        ...state.flips.slice(0, state.currentIndex),
        {...state.flips[state.currentIndex], answer: AnswerType.Inappropriate},
        ...state.flips.slice(state.currentIndex + 1),
      ]
      const idx = Math.min(state.currentIndex + 1, state.flips.length - 1)
      return {
        ...state,
        flips,
        currentIndex: idx,
        canSubmit: canSubmit(flips, idx),
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const ValidationStateContext = createContext()
const ValidationDispatchContext = createContext()

const db = global.validationDb

// eslint-disable-next-line react/prop-types
export function ValidationProvider({children}) {
  const [state, dispatch] = useLogger(
    useReducer(validationReducer, initialState)
  )
  const seconds = useValidationTimer()

  useEffect(() => {
    const validation = db.getValidation()
    dispatch({type: LOAD_VALIDATION, validation})
  }, [dispatch])

  const epoch = useEpochState()
  const {archiveFlips} = useFlips()

  useEffect(() => {
    if (epoch !== null) {
      const {epoch: savedEpoch} = db.getValidation()
      if (epoch.epoch !== savedEpoch) {
        archiveFlips()
        db.resetValidation(epoch.epoch)
        dispatch({type: RESET_EPOCH, epoch: epoch.epoch})
      }
    }
  }, [archiveFlips, dispatch, epoch])

  useEffect(() => {
    async function sendAnswers(type) {
      switch (type) {
        case SessionType.Short: {
          await submitShortAnswers(dispatch, state.flips, epoch.epoch)
          break
        }
        case SessionType.Long: {
          await submitLongAnswers(dispatch, state.flips, epoch.epoch)
          break
        }
        default:
          break
      }
    }

    // prevent mess with epoch and seconds switching simultaneously
    if (seconds === 1) {
      const {shortAnswersSubmitted, longAnswersSubmitted, flips} = state
      const {currentPeriod} = epoch
      const hasSomeAnswer = flips.map(x => x.answer).some(hasAnswer)

      if (hasSomeAnswer) {
        if (
          currentPeriod === EpochPeriod.ShortSession &&
          !shortAnswersSubmitted
        ) {
          sendAnswers(SessionType.Short)
        }
        if (
          currentPeriod === EpochPeriod.LongSession &&
          !longAnswersSubmitted
        ) {
          sendAnswers(SessionType.Long)
        }
      }
    }
  }, [dispatch, epoch, seconds, state])

  return (
    <ValidationStateContext.Provider value={state}>
      <ValidationDispatchContext.Provider value={dispatch}>
        {children}
      </ValidationDispatchContext.Provider>
    </ValidationStateContext.Provider>
  )
}

export function useValidationState() {
  const context = useContext(ValidationStateContext)
  if (context === undefined) {
    throw new Error(
      'useValidationState must be used within a ValidationProvider'
    )
  }
  return context
}

export function useValidationDispatch() {
  const context = useContext(ValidationDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useValidationDispatch must be used within a ValidationProvider'
    )
  }
  return context
}

export async function fetchFlips(dispatch, type) {
  try {
    const hashes = await api.fetchFlipHashes(type)
    if (hashes) {
      const hexes = await Promise.all(
        hashes
          .filter(x => x.ready)
          .map(x => x.hash)
          .map(hash => fetchFlip(hash).then(resp => ({hash, ...resp.result})))
      )
      dispatch({type: FETCH_FLIPS_SUCCEEDED, hashes, hexes})
    } else {
      dispatch({
        type: FETCH_FLIPS_FAILED,
        error: new Error(`Cannot fetch flips`),
      })
    }
  } catch (error) {
    dispatch({type: FETCH_FLIPS_FAILED, error})
  }
}

function prepareAnswers(flips) {
  return flips.map(flip => ({
    answer: hasAnswer(flip.answer) ? flip.answer : 0,
    easy: false,
  }))
}

export async function submitShortAnswers(dispatch, flips, epoch) {
  const payload = prepareAnswers(flips)

  await api.submitShortAnswers(payload, 0, 0)
  db.setShortAnswers(payload, epoch)

  dispatch({type: SUBMIT_SHORT_ANSWERS, answers: payload, epoch})
}

export async function submitLongAnswers(dispatch, flips, epoch) {
  const payload = prepareAnswers(flips)

  await api.submitLongAnswers(payload, 0, 0)
  db.setLongAnswers(payload, epoch)

  dispatch({type: SUBMIT_LONG_ANSWERS, answers: payload, epoch})
}
