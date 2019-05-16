import React, {memo} from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import {Box, Text, Button} from '../../../shared/components'
import theme from '../../../shared/theme'
import {
  getFromLocalStorage,
  FLIP_DRAFTS_STORAGE_KEY,
  setToLocalStorage,
  FLIPS_STORAGE_KEY,
} from '../utils/storage'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

function Flip({id, caption, pics, createdAt, onUpdateFlips}) {
  const draft = !!id
  const storageKey = draft ? FLIP_DRAFTS_STORAGE_KEY : FLIPS_STORAGE_KEY
  return (
    <Box m={`${theme.spacings.normal} 0`} w="25%">
      <Box m={`0 0 ${theme.spacings.small}`}>
        <img
          width={150}
          src={draft ? pics[0] : fromBlob(pics[0])}
          alt="flip-cover"
          style={{borderRadius: '4px'}}
        />
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text>{caption}</Text>
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text color={theme.colors.muted}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Box>
      <Box p={theme.spacings.small}>
        {draft && (
          <Button
            onClick={() => {
              Router.push(`/flips/edit?id=${id}`)
            }}
          >
            Edit
          </Button>
        )}
        <Button
          onClick={() => {
            const drafts = getFromLocalStorage(storageKey)
            const nextDrafts = drafts.filter(d => d.id !== id)
            setToLocalStorage(storageKey, nextDrafts)
            onUpdateFlips(nextDrafts)
          }}
        >
          Delete {draft ? '' : 'from cache'}
        </Button>
      </Box>
    </Box>
  )
}

const flipImageType = PropTypes.oneOfType([PropTypes.object, PropTypes.string])

Flip.propTypes = {
  id: PropTypes.string,
  caption: PropTypes.string.isRequired,
  pics: PropTypes.arrayOf(flipImageType).isRequired,
  createdAt: PropTypes.number.isRequired,
  onUpdateFlips: PropTypes.func,
}

export default memo(Flip)
