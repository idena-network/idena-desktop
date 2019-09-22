/* eslint-disable react/prop-types */
import React from 'react'

export default function List({m, children}) {
  return (
    <ul>
      {children}
      <style jsx>{`
        ul {
          list-style-type: none;
          padding: 0;
          margin: ${m} || 0;
          text-align: left;
        }
      `}</style>
    </ul>
  )
}
