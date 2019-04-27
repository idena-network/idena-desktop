import React from 'react'
import {LastMessage} from '.'

export default ({chats}) => (
  <div>
    {chats.map(chat => (
      <LastMessage chat={chat} />
    ))}
  </div>
)
