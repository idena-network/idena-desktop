import React from 'react'
import Message from './message'

// eslint-disable-next-line react/prop-types
export default function MessageList({messages}) {
  return (
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
}
