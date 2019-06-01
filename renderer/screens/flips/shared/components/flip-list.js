import React from 'react'
import PropTypes from 'prop-types'
import Flip from './flip'
import Flex from '../../../../shared/components/flex'
import FlipPlaceholder from './flip-placeholder'

function FlipList({flips = [], onUpdateFlips}) {
  return (
    <Flex css={{flexWrap: 'wrap'}}>
      {flips.map((flip, idx) =>
        flip ? (
          <Flip
            key={flip.hash || flip.id}
            {...flip}
            onUpdateFlips={onUpdateFlips}
          />
        ) : (
          // eslint-disable-next-line react/no-array-index-key
          <FlipPlaceholder key={idx} idx={idx} />
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
