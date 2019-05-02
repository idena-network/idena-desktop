import React from 'react'
import PropTypes from 'prop-types'
import Flip from './flip'
import Flex from '../../../shared/components/flex'

function FlipList({flips}) {
  return (
    <Flex justify="space-between" css={{flexWrap: 'wrap'}}>
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
