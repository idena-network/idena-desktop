import React from 'react'
import LastMessage from './last-message'

// eslint-disable-next-line react/prop-types
export default function ChatList({chats}) {
  return (
    <div>
      {chats.map(chat => (
        <LastMessage chat={chat} />
      ))}
    </div>
  )
}
