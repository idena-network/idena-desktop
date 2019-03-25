import React from 'react'
import Message from './message'

export default ({messages}) => (
  <ul>
    {messages.map(msg => (
      <Message {...msg} />
    ))}
    <style jsx>{`
      ul {
        flex: 1;
        padding: 0;
        margin: 0;
      }
    `}</style>
  </ul>
)
