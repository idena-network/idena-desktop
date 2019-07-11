import React from 'react'
import * as api from '../api/validation'
import {useEpochState} from './epoch-context'
import useFlips from '../utils/useFlips'

const AnswerType = {
  None: 0,
  Left: 1,
  Right: 2,
  Inappropriate: 3,
}

const LOAD_VALIDATION = 'LOAD_VALIDATION'
const SUBMIT_SHORT_ANSWERS = 'SUBMIT_SHORT_ANSWERS'
const SUBMIT_LONG_ANSWERS = 'SUBMIT_LONG_ANSWERS'
const RESET_EPOCH = 'RESET_EPOCH'

const initialState = {
  shortAnswers: [],
  longAnswers: [],
  epoch: null,
}

function validationReducer(state, action) {
  switch (action.type) {
    case LOAD_VALIDATION: {
      return {...state, ...action.validation}
    }
    case SUBMIT_SHORT_ANSWERS: {
      return {...state, shortAnswers: action.answers, epoch: action.epoch}
    }
    case SUBMIT_LONG_ANSWERS: {
      return {...state, longAnswers: action.answers, epoch: action.epoch}
    }
    case RESET_EPOCH: {
      return {...state, shortAnswers: [], longAnswers: [], epoch: action.epoch}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

const ValidationStateContext = React.createContext()
const ValidationDispatchContext = React.createContext()

const db = global.validationDb

// eslint-disable-next-line react/prop-types
function ValidationProvider({children}) {
  const [state, dispatch] = React.useReducer(validationReducer, initialState)

  React.useEffect(() => {
    const validation = db.getValidation()
    dispatch({type: LOAD_VALIDATION, validation})
  }, [])

  const epoch = useEpochState()
  const {archiveFlips} = useFlips()

  React.useEffect(() => {
    if (epoch !== null) {
      const {epoch: savedEpoch} = db.getValidation()
      if (epoch.epoch !== savedEpoch) {
        db.resetValidation(epoch.epoch)
        dispatch({type: RESET_EPOCH, epoch: epoch.epoch})
        archiveFlips()
      }
    }
  }, [archiveFlips, epoch])

  return (
    <ValidationStateContext.Provider value={state}>
      <ValidationDispatchContext.Provider value={dispatch}>
        {children}
      </ValidationDispatchContext.Provider>
    </ValidationStateContext.Provider>
  )
}

function useValidationState() {
  const context = React.useContext(ValidationStateContext)
  if (context === undefined) {
    throw new Error(
      'useValidationState must be used within a ValidationProvider'
    )
  }
  return context
}

function useValidationDispatch() {
  const context = React.useContext(ValidationDispatchContext)
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
