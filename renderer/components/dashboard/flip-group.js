import React from 'react'
import PropTypes from 'prop-types'
import {FlipList} from './flip-list'
import theme from '../../theme'
import {Text} from '../../shared/components'

function FlipGroup({name, flips = []}) {
  return (
    <div>
      <Text color={theme.colors.muted}>{name}</Text>
      {flips.length ? (
        <FlipList flips={flips} />
      ) : (
        <div>
          <Text>No drafts here yet...</Text>
        </div>
      )}
      <style jsx>{`
        div {
          margin: 1.5em 0;
        }
      `}</style>
    </div>
  )
}

FlipGroup.propTypes = {
  name: PropTypes.string.isRequired,
  flips: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default FlipGroup
