import React from 'react'

export default ({children}) => (
  <div>
    {children}
    <style jsx>{`
      div {
        border-right: solid 1px rgb(232, 234, 237);
        min-height: 100vh;
        padding: 1em;
      }
    `}</style>
  </div>
)
