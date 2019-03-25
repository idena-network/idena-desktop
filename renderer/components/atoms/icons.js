import React from 'react'
import theme from '../../theme'

export const AddIcon = ({width = '24px'}) => (
  <div>
    +
    <style jsx>{`
      div {
        background: ${theme.colors.primary};
        border-radius: 10px;
        color: white;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: csenter;
        width: ${width};
      }
    `}</style>
  </div>
)
