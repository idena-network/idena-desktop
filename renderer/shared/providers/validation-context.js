import React, {useReducer, useEffect, createContext, useContext} from 'react'
import {decode} from 'rlp'
import * as api from '../api/validation'
import {useEpochState, EpochPeriod} from './epoch-context'
import useFlips from '../utils/useFlips'
import {useValidationTimer} from '../hooks/use-validation'

const AnswerType = {
  None: 0,
  Left: 1,
  Right: 2,
  Inappropriate: 3,
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
      const decodedFlip = decode(fromHexString(hex.hex.substring(2)))
      const orders = decodedFlip[1].map(order => order.map(x => x[0] || 0))
      return {
        hash,
        ready,
        pics: decodedFlip[0],
        orders,
        answer: null,
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

const LOAD_VALIDATION = 'LOAD_VALIDATION'
const SUBMIT_SHORT_ANSWERS = 'SUBMIT_SHORT_ANSWERS'
const SUBMIT_LONG_ANSWERS = 'SUBMIT_LONG_ANSWERS'
const RESET_EPOCH = 'RESET_EPOCH'
export const START_FETCH_FLIPS = 'START_FETCH_FLIPS'
export const FETCH_FLIPS_SUCCEEDED = 'FETCH_FLIPS_SUCCEEDED'
export const FETCH_FLIPS_FAILED = 'FETCH_FLIPS_FAILED'
export const FETCH_MISSING_FLIPS_SUCCEEDED = 'FETCH_MISSING_FLIPS_SUCCEEDED'
export const ANSWER = 'ANSWER'
export const NEXT = 'NEXT'
export const PREV = 'PREV'
export const PICK = 'PICK'
export const REPORT_ABUSE = 'REPORT_ABUSE'
export const RESET_CEREMONY = 'RESET_CEREMONY'

const initialCeremonyState = {
  hashes: [],
  flips: [],
  loading: true,
  currentIndex: 0,
  canSubmit: false,
}

const initialState = {
  shortAnswers: [],
  longAnswers: [],
  epoch: null,
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
        ...initialCeremonyState,
      }
    }
    case SUBMIT_LONG_ANSWERS: {
      return {
        ...state,
        longAnswers: action.answers,
        epoch: action.epoch,
        ...initialCeremonyState,
      }
    }
    case RESET_EPOCH: {
      return {
        ...state,
        shortAnswers: [],
        longAnswers: [],
        epoch: action.epoch,
        ...initialCeremonyState,
      }
    }
    case START_FETCH_FLIPS: {
      return {
        ...state,
        ...initialCeremonyState,
        loading: true,
      }
    }
    case FETCH_FLIPS_SUCCEEDED: {
      const {hashes, hexes} = action
      const flips = decodeFlips(hashes, hexes)
      return {
        ...state,
        flips,
        loading: false,
      }
    }
    case FETCH_MISSING_FLIPS_SUCCEEDED: {
      const {hexes} = action
      const flips = decodeFlips(state.hashes, hexes)
      return {
        ...state,
        flips,
        loading: false,
      }
    }
    case FETCH_FLIPS_FAILED: {
      return {
        ...state,
        loading: true,
        error: action.error,
      }
    }
    case PREV: {
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      }
    }
    case NEXT: {
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.flips.length - 1),
      }
    }
    case PICK: {
      return {
        ...state,
        currentIndex: action.index,
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
        canSubmit: flips.map(x => x.answer).every(hasAnswer),
      }
    }
    case REPORT_ABUSE: {
      const flips = [
        ...state.flips.slice(0, state.currentIndex),
        {...state.flips[state.currentIndex], answer: AnswerType.Inappropriate},
        ...state.flips.slice(state.currentIndex + 1),
      ]
      return {
        ...state,
        flips,
        currentIndex: Math.min(state.currentIndex + 1, state.flips.length - 1),
        canSubmit: flips.map(x => x.answer).every(hasAnswer),
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
function ValidationProvider({children}) {
  const [state, dispatch] = useReducer(validationReducer, initialState)
  const seconds = useValidationTimer()

  useEffect(() => {
    const validation = db.getValidation()
    dispatch({type: LOAD_VALIDATION, validation})
  }, [])

  const epoch = useEpochState()
  const {archiveFlips} = useFlips()

  useEffect(() => {
    if (epoch !== null) {
      const {epoch: savedEpoch} = db.getValidation()
      if (epoch.epoch !== savedEpoch) {
        db.resetValidation(epoch.epoch)
        dispatch({type: RESET_EPOCH, epoch: epoch.epoch})
        archiveFlips()
      }
    }
  }, [archiveFlips, epoch])

  useEffect(() => {
    if (Number.isFinite(seconds) && seconds === 1) {
      if (epoch.currentPeriod === EpochPeriod.ShortSession) {
        console.info('Auto-sending short answers', {
          answers: state.shortAnswers,
          epoch: epoch.epoch,
        })
        // eslint-disable-next-line no-use-before-define
        submitShortAnswers(dispatch, state.shortAnswers, epoch.epoch)
      } else if (epoch.currentPeriod === EpochPeriod.ShortSession) {
        console.info('Auto-sending long answers', {
          answers: state.longAnswers,
          epoch: epoch.epoch,
        })
        // eslint-disable-next-line no-use-before-define
        submitLongAnswers(dispatch, state.longAnswers, epoch.epoch)
      }
    }
  }, [epoch, seconds, state])

  return (
    <ValidationStateContext.Provider value={state}>
      <ValidationDispatchContext.Provider value={dispatch}>
        {children}
      </ValidationDispatchContext.Provider>
    </ValidationStateContext.Provider>
  )
}

function useValidationState() {
  const context = useContext(ValidationStateContext)
  if (context === undefined) {
    throw new Error(
      'useValidationState must be used within a ValidationProvider'
    )
  }
  return context
}

function useValidationDispatch() {
  const context = useContext(ValidationDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useValidationDispatch must be used within a ValidationProvider'
    )
  }
  return context
}

function prepareAnswers(flips) {
  return flips.map(flip => ({
    hash: flip.hash,
    easy: false,
    answer: Number.isFinite(flip.answer) ? flip.answer : 0,
  }))
}

async function submitShortAnswers(dispatch, flips, epoch) {
  const payload = prepareAnswers(flips)

  await api.submitShortAnswers(payload, 0, 0)
  db.setShortAnswers(payload, epoch)

  dispatch({type: SUBMIT_SHORT_ANSWERS, answers: payload, epoch})
}

async function submitLongAnswers(dispatch, flips, epoch) {
  const payload = prepareAnswers(flips)

  await api.submitLongAnswers(payload, 0, 0)
  db.setLongAnswers(payload, epoch)

  dispatch({type: SUBMIT_LONG_ANSWERS, answers: payload, epoch})
}

export {
  ValidationProvider,
  useValidationState,
  useValidationDispatch,
  submitShortAnswers,
  submitLongAnswers,
  AnswerType,
}
