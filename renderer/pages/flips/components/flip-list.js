import React from 'react'
import PropTypes from 'prop-types'
import Flip from './flip'
import Flex from '../../../shared/components/flex'

function FlipList({flips}) {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      {flips.map(flip => (
        <Flip key={flip.hash} {...flip} />
      ))}
    </Flex>
  )
}

FlipList.propTypes = {
  flips: PropTypes.arrayOf(PropTypes.object),
}

export default FlipList
