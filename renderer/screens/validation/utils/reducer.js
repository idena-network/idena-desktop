import {decode} from 'rlp'
import {AnswerType} from '../../../shared/providers/validation-context'

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

export const START_FETCH = 'START_FETCH'
export const FETCH_SUCCEEDED = 'FETCH_SUCCEEDED'
export const FETCH_FAILED = 'FETCH_FAILED'
export const FETCH_MISSING_SUCCEEDED = 'FETCH_MISSING_SUCCEEDED'
export const ANSWER = 'ANSWER'
export const NEXT = 'NEXT'
export const PREV = 'PREV'
export const PICK = 'PICK'
export const REPORT_ABUSE = 'REPORT_ABUSE'

export const initialState = {
  hashes: [],
  flips: [],
  loading: true,
  currentIndex: 0,
  canSubmit: false,
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case START_FETCH: {
      return {
        ...state,
        loading: true,
      }
    }
    case FETCH_SUCCEEDED: {
      const {hashes, hexes} = action
      const flips = decodeFlips(hashes, hexes)
      return {
        ...state,
        flips,
        loading: false,
      }
    }
    case FETCH_MISSING_SUCCEEDED: {
      const {hexes} = action
      const flips = decodeFlips(state.hashes, hexes)
      return {
        ...state,
        flips,
        loading: false,
      }
    }
    case FETCH_FAILED: {
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
    default:
      return state
  }
}
