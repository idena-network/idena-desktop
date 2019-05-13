import React from 'react'
import PropTypes from 'prop-types'
import Router from 'next/router'
import Flip from './flip'
import Flex from '../../../shared/components/flex'
import {Box, Button} from '../../../shared/components'
import theme from '../../../shared/theme'
import {
  setToLocalStorage,
  getFromLocalStorage,
  FLIP_DRAFTS_STORAGE_KEY,
} from '../utils/storage'

// eslint-disable-next-line react/prop-types
const DraftedFlip = ({id, onUpdateFlips, ...flipProps}) => (
  <Box m={`${theme.spacings.normal} 0`} w="25%">
    <Flip id={id} {...flipProps} />
    <Box p={theme.spacings.small}>
      <Button
        onClick={() => {
          Router.push(`/flips/edit?id=${id}`)
        }}
      >
        Edit
      </Button>
      <Button
        onClick={() => {
          const drafts = getFromLocalStorage(FLIP_DRAFTS_STORAGE_KEY)
          const nextDrafts = drafts.filter(d => d.id !== id)
          setToLocalStorage(FLIP_DRAFTS_STORAGE_KEY, nextDrafts)
          onUpdateFlips(nextDrafts)
        }}
      >
        Delete
      </Button>
    </Box>
  </Box>
)

function FlipList({flips, onUpdateFlips}) {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      {flips.map(flip =>
        flip.id ? (
          <DraftedFlip key={flip.id} {...flip} onUpdateFlips={onUpdateFlips} />
        ) : (
          <Flip key={flip.hash} {...flip} />
        )
      )}
    </Flex>
  )
}

FlipList.propTypes = {
  flips: PropTypes.arrayOf(PropTypes.object),
  onUpdateFlips: PropTypes.func,
}

export default FlipList
