import {
  getFromLocalStorage,
  setToLocalStorage,
  FLIP_DRAFTS_STORAGE_KEY,
} from '../../../utils/storage'

/* eslint-disable import/prefer-default-export */
export function set({id, ...flip}) {
  const drafts = getFromLocalStorage(FLIP_DRAFTS_STORAGE_KEY, [])
  const draftIdx = drafts.findIndex(d => d.id === id)

  const nextDrafts =
    draftIdx > -1
      ? [
          ...drafts.slice(0, draftIdx),
          {id, ...flip},
          ...drafts.slice(draftIdx + 1),
        ]
      : [...drafts, {id, ...flip}]

  setToLocalStorage(FLIP_DRAFTS_STORAGE_KEY, nextDrafts)
}
