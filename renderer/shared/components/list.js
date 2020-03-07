import React from 'react'

// eslint-disable-next-line react/prop-types
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
