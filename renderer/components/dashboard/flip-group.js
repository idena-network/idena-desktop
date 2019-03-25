import React from 'react'
import {Text} from '../atoms'
import {FlipList} from './flip-list'
import theme from '../../theme'

export default ({name, flips = []}) => (
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
