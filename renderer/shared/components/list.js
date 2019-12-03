/* eslint-disable react/prop-types */
import React from 'react'

export default function List({m, children, ...props}) {
  return (
    <ul {...props}>
      {children}
      <style jsx>{`
        ul {
          list-style-type: none;
          padding: 0;
          margin: ${m || 0};
          text-align: left;
        }
      `}</style>
    </ul>
  )
}
