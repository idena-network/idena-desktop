import React from 'react'
import {Text} from '../atoms'
import theme from '../../theme'

export default ({name = 'Julia', status = 'Online'}) => (
  <div>
    <i>🤷</i>
    <div>
      <div>{name}</div>
      <Text color={theme.colors.primary} small>
        {status}
      </Text>
    </div>
    <style jsx>{`
      div {
        border-bottom: solid 1px rgb(232, 234, 237);
        display: flex;
        align-items: center;
        padding: 1em 0;
      }
      i {
        background: ${theme.colors.gray};
        border-radius: 8px;
        margin: 0 1em;
        padding: 0.5em 0.7em;
        font-style: normal;
      }
      div > div {
        border: none;
        display: block;
        padding: 0;
      }
    `}</style>
  </div>
)
