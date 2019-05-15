import React from 'react'
import PropTypes from 'prop-types'
import Flip from './flip'
import Flex from '../../../shared/components/flex'

function FlipList({flips, onUpdateFlips}) {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      {flips.map(flip => (
        <Flip
          key={flip.hash || flip.id}
          {...flip}
          onUpdateFlips={onUpdateFlips}
        />
      ))}
    </Flex>
  )
}

FlipList.propTypes = {
  flips: PropTypes.arrayOf(PropTypes.object),
  onUpdateFlips: PropTypes.func,
}

export default FlipList
