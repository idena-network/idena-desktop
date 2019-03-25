import React from 'react'
import theme from '../../theme'

export default () => (
  <div>
    <a href="/">Share Idena</a>
    <a href="/">Invite people</a>
    <style jsx>
      {`
        div {
          margin: 1em 0 2em;
        }
        a {
          color: ${theme.colors.primary};
          display: block;
          margin: 1em 0;
          text-decoration: none;
        }
      `}
    </style>
  </div>
)
