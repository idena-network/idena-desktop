import {
  getFromLocalStorage,
  FLIPS_STORAGE_KEY,
} from '../../../../flips/utils/storage'

/* eslint-disable import/prefer-default-export */

export async function fetchFlipHashes(type) {
  return getFromLocalStorage(FLIPS_STORAGE_KEY).map(hash => ({
    hash,
    ready: true,
  }))
}

export async function fetchFlip(hash) {
  return {hash}
}

export async function submitShortAnswers(answers, nonce, epoch) {
  return answers
}

export async function submitLongAnswers(answers, nonce, epoch) {
  return answers
}
