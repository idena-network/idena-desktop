import React from 'react'
import {Text} from '../atoms'
import {FlipList} from './flip-list'
import theme from '../../../theme'

export default ({name, flips = []}) => (
  <div>
    <Text color={theme.colors.muted}>{name}</Text>
    <FlipList flips={flips} />
    <style jsx>{`
      div {
        margin: 1.5em 0;
      }
    `}</style>
  </div>
)
