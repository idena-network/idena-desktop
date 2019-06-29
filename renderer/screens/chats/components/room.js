import React from 'react'
import RoomHeader from './room-header'
import MessageList from './message-list'
import MessageForm from './message-form'

export default function Room({messages}) {
  return (
    <div>
      <RoomHeader />
      <MessageList messages={messages} />
      <MessageForm />
      <style jsx>{`
        div {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
      `}</style>
    </div>
  )
}
