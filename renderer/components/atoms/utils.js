import React from 'react'
import {Text} from './typo'
import theme from '../../theme'

export const Figure = ({label, value, postfix = ''}) => (
  <div>
    <label>{label}</label>
    <Text wrap>{value}</Text> {postfix && <Text>{postfix}</Text>}
    <style jsx>{`
      div {
        margin: 0 0 1em;
      }

      label {
        color: ${theme.colors.muted};
        display: block;
        margin-bottom: 0.5em;
      }
    `}</style>
  </div>
)
