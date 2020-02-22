/* eslint-disable react/prop-types */
import React from 'react'
import LastMessage from './last-message'

export default function ChatList({chats}) {
  return (
    <div>
      {chats.map(chat => (
        <LastMessage chat={chat} />
      ))}
    </div>
  )
}
