import React, {createContext, useState, useEffect} from 'react'
import {fetchChatList} from '../services/api'

const ChatContext = createContext()

export const ChatProvider = ({children}) => {
  const [chats, setChats] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchChats() {
      const fetchedChats = await fetchChatList()
      if (!ignore) {
        setChats(fetchedChats)
      }
    }

    fetchChats()

    return () => {
      ignore = true
    }
  }, [])
  return <ChatContext.Provider value={chats}>{children}</ChatContext.Provider>
}

export default ChatContext
