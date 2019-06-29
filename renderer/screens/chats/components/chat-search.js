import React from 'react'
import {AddIcon} from '../../../shared/components'
import theme from '../../../shared/theme'

export default function Search() {
  return (
    <div>
      <input type="search" placeholder="Search" />
      <AddIcon />
      <style jsx>{`
        div {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        input[type='search'] {
          background: ${theme.colors.gray};
          border: none;
          border-radius: 8px;
          font-size: 1em;
          margin-right: 1em;
          padding: 0.5em;
          text-align: center;
          flex: 1;
        }
      `}</style>
    </div>
  )
}
