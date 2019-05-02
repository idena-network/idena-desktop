import React from 'react'
import PropTypes from 'prop-types'
import Flex from '../../../shared/components/flex'
import Flip from './flip'

function FlipList({flips}) {
  return (
    <Flex>
      {flips.map((flip, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Flip key={`flip-${idx}`} pics={flip} dir="row" />
      ))}
    </Flex>
  )
}

FlipList.propTypes = {
  flips: PropTypes.arrayOf(PropTypes.array),
}

export default FlipList
