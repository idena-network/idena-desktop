/* eslint-disable no-use-before-define */
import React, {useReducer, useEffect, createContext, useContext} from 'react'
import {decode} from 'rlp'
import * as api from '../api/validation'
import {useEpochState} from './epoch-context'
import useFlips from '../utils/useFlips'
import {useValidationTimer} from '../hooks/use-validation-timer'
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
  Qualification: 'qualification',
}

function fromHexString(hexString) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  )
}

function reorderFlips(flips) {
  const ready = []
  const loading = []
  const failed = []
  const hidden = []
  for (let i = 0; i < flips.length; i += 1) {
    if (flips[i].hidden) {
      hidden.push(flips[i])
    } else if (flips[i].ready && flips[i].loaded) {
      ready.push(flips[i])
    } else if (flips[i].failed) {
      failed.push(flips[i])
    } else {
      loading.push(flips[i])
    }
  }
  return [...ready, ...loading, ...failed, ...hidden]
}

function decodeFlips(data, currentFlips) {
  const flips = currentFlips.length
    ? currentFlips
    : data.map(item => ({
        ...item,
        pics: null,
        urls: null,
        orders: null,
        answer: null,
        loaded: false,
      }))
  return flips.map(flip => {
    if ((flip.ready && flip.loaded) || flip.failed) {
      return flip
    }
    const item = data.find(x => x.hash === flip.hash)
    if (item.ready) {
      try {
        const {hex, publicHex, privateHex} = item
        let pics
        let urls
        let orders
        if (privateHex && privateHex !== '0x') {
          const decodedPublicFlipPart = decode(
            fromHexString((publicHex || hex).substring(2))
          )
          ;[pics] = decodedPublicFlipPart
          const decodedPrivateFlipPart = decode(
            fromHexString(privateHex.substring(2))
          )
          pics = pics.concat(decodedPrivateFlipPart[0])
          urls = pics.map(pic =>
            URL.createObjectURL(new Blob([pic], {type: 'image/jpeg'}))
          )
          orders = decodedPrivateFlipPart[1].map(order =>
            order.map(x => x[0] || 0)
          )
        } else {
          const decodedFlip = decode(fromHexString(hex.substring(2)))
          ;[pics] = decodedFlip
          urls = pics.map(pic =>
            URL.createObjectURL(new Blob([pic], {type: 'image/jpeg'}))
          )
          orders = decodedFlip[1].map(order => order.map(x => x[0] || 0))
        }
        return {
          ...flip,
          ready: true,
          pics,
          urls,
          orders,
          loaded: true,
          hidden: flip.hidden || item.hidden,
        }
      } catch {
        return {
          hash: flip.hash,
          failed: true,
          hidden: flip.hidden || item.hidden,
          ready: false,
          pics: null,
          urls: null,
          orders: null,
          answer: null,
          loaded: false,
        }
      }
    } else {
      return {
        hash: item.hash,
        hidden: item.hidden,
        ready: item.ready,
      }
    }
  })
}

export function hasAnswer(answer) {
  return Number.isFinite(answer)
}

function canSubmit(flips, stage, idx) {
  const availableFlips = flips.filter(x => !x.hidden && !x.failed)
  const visibleFlips = flips.filter(x => !x.hidden)
  if (stage === SessionType.Qualification) {
    return (
      availableFlips.every(
        ({words, irrelevantWords}) =>
          words &&
          words.length &&
          irrelevantWords !== null &&
          irrelevantWords !== undefined
      ) || idx >= visibleFlips.length - 1
    )
  }
  return (
    availableFlips.map(x => x.answer).every(hasAnswer) ||
    idx >= visibleFlips.length - 1
  )
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
export const SHOW_EXTRA_FLIPS = 'SHOW_EXTRA_FLIPS'
export const WORDS_FETCHED = 'WORDS_FETCHED'
export const IRRELEVANT_WORDS_TOGGLED = 'IRRELEVANT_WORDS_TOGGLED'
export const QUALIFICATION_REQUESTED = 'QUALIFICATION_REQUESTED'
export const QUALIFICATION_STARTED = 'QUALIFICATION_STARTED'

const initialCeremonyState = {
  flips: [],
  loading: true,
  currentIndex: 0,
  canSubmit: false,
  ready: false,
}

const initialState = {
  ...initialCeremonyState,
  shortAnswers: [],
  longAnswers: [],
  epoch: null,
  shortAnswersSubmitted: false,
  longAnswersSubmitted: false,
  stage: SessionType.Short,
  qualificationRequested: false,
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
        stage: SessionType.Long,
        ...initialCeremonyState,
      }
    }
    case SUBMIT_LONG_ANSWERS: {
      return {
        ...state,
        longAnswers: action.answers,
        epoch: action.epoch,
        longAnswersSubmitted: true,
        qualificationRequested: false,
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
      const {data, sessionType} = action
      let flips = decodeFlips(data, state.flips)
      const {currentIndex} = state
      if (sessionType === SessionType.Long) {
        flips = flips.map(flip => ({
          ...flip,
          hidden: !flip.ready,
        }))
      }
      flips = reorderFlips(flips)
      return {
        ...state,
        flips,
        currentIndex,
        loading: false,
        ready: flips.every(x => x.ready || x.failed),
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
      const idx = Math.max(state.currentIndex - 1, 0)
      const {flips, stage} = state
      return {
        ...state,
        currentIndex: idx,
        canSubmit: canSubmit(flips, stage, idx),
      }
    }
    case NEXT: {
      const idx = Math.min(state.currentIndex + 1, state.flips.length - 1)
      const {flips, stage} = state
      return {
        ...state,
        currentIndex: idx,
        canSubmit: canSubmit(flips, stage, idx),
      }
    }
    case PICK: {
      const {flips, stage} = state
      return {
        ...state,
        currentIndex: action.index,
        canSubmit: canSubmit(flips, stage, action.index),
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
        canSubmit: canSubmit(flips, state.stage, state.currentIndex),
      }
    }
    case REPORT_ABUSE: {
      const flips = [
        ...state.flips.slice(0, state.currentIndex),
        {...state.flips[state.currentIndex], answer: AnswerType.Inappropriate},
        ...state.flips.slice(state.currentIndex + 1),
      ]
      const availableFlipsLength = flips.filter(x => !x.hidden).length
      const idx = Math.min(state.currentIndex + 1, availableFlipsLength - 1)
      return {
        ...state,
        flips,
        currentIndex: idx,
        canSubmit: canSubmit(flips, state.stage, idx),
      }
    }
    case SHOW_EXTRA_FLIPS: {
      let flips = state.flips.map(flip => ({
        ...flip,
        failed: !flip.ready,
      }))
      let availableExtraFlips = flips.filter(
        flip => flip.failed && !flip.hidden
      ).length
      let openedFlipsCount = 0
      flips = flips.map(flip => {
        if (!flip.hidden) {
          return flip
        }
        const shouldBecomeAvailable =
          flip.ready && flip.loaded && availableExtraFlips > 0
        availableExtraFlips -= 1
        openedFlipsCount += 1
        return {
          ...flip,
          hidden: !shouldBecomeAvailable,
        }
      })

      for (let i = flips.length - 1; i >= 0; i -= 1) {
        if (openedFlipsCount > 0 && flips[i].failed) {
          openedFlipsCount -= 1
          flips[i].hidden = true
        }
      }

      const reorderedFlips = reorderFlips(flips)

      return {
        ...state,
        canSubmit: canSubmit(reorderedFlips, state.stage, state.currentIndex),
        flips: reorderedFlips,
        ready: true,
      }
    }
    case IRRELEVANT_WORDS_TOGGLED: {
      const currentFlip = state.flips[state.currentIndex]
      const flips = [
        ...state.flips.slice(0, state.currentIndex),
        {...currentFlip, irrelevantWords: action.irrelevant},
        ...state.flips.slice(state.currentIndex + 1),
      ]
      return {
        ...state,
        flips,
      }
    }
    case WORDS_FETCHED: {
      const {
        words: [hash, fetchedWords],
      } = action
      const flip = state.flips.find(f => f.hash === hash)
      return {
        ...state,
        flips: [
          ...state.flips.slice(0, state.flips.indexOf(flip)),
          {...flip, words: flip.words || fetchedWords},
          ...state.flips.slice(state.flips.indexOf(flip) + 1),
        ],
      }
    }
    case QUALIFICATION_REQUESTED:
      return {
        ...state,
        qualificationRequested: true,
      }
    case QUALIFICATION_STARTED: {
      const firstUnqualifiedIdx = state.flips.findIndex(
        ({irrelevantWords}) =>
          irrelevantWords === undefined || irrelevantWords === null
      )
      return {
        ...state,
        currentIndex: firstUnqualifiedIdx,
        qualificationRequested: false,
        stage: SessionType.Qualification,
        canSubmit: canSubmit(
          state.flips,
          SessionType.Qualification,
          firstUnqualifiedIdx
        ),
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
  const {secondsLeftForShortSession} = useValidationTimer()

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
    async function sendAnswers() {
      await submitShortAnswers(dispatch, state.flips, epoch.epoch)
    }

    if (secondsLeftForShortSession === 0) {
      const {shortAnswersSubmitted, flips} = state
      const readyFlips = flips.filter(x => x.ready)
      const hasEnoughAnswers =
        readyFlips.length > 0 &&
        readyFlips.filter(x => hasAnswer(x.answer)).length >=
          readyFlips.length / 2
      if (hasEnoughAnswers && !shortAnswersSubmitted) {
        sendAnswers()
      }
    }
  }, [dispatch, epoch, secondsLeftForShortSession, state])

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

export async function fetchFlips(dispatch, type, flips = []) {
  try {
    const hashes = await api.fetchFlipHashes(type)
    if (hashes) {
      const data = await Promise.all(
        hashes.map(({hash, extra: hidden, ready}) => {
          const existingFlip = flips.find(f => f.hash === hash)
          if (existingFlip) {
            if (
              (existingFlip.ready && existingFlip.loaded) ||
              existingFlip.failed
            ) {
              return Promise.resolve({
                hash: existingFlip.hash,
                hidden: existingFlip.hidden,
                ready: existingFlip.ready,
              })
            }
          } else if (!ready) {
            return Promise.resolve({hash, hidden, ready})
          }
          return fetchFlip(hash).then(resp => ({
            hash,
            hidden,
            ready,
            ...resp.result,
          }))
        })
      )
      dispatch({type: FETCH_FLIPS_SUCCEEDED, data, sessionType: type})
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
    wrongWords: flip.irrelevantWords,
    hash: flip.hash,
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
