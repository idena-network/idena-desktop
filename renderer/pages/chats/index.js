import React, {useState, useEffect} from 'react'
import {Row, Col} from '../../shared/components'
import Layout from '../../shared/components/layout'
import Nav from '../../screens/chats/components/chat-nav'
import Search from '../../screens/chats/components/chat-search'
import ChatList from '../../screens/chats/components/chat-list'
import Room from '../../screens/chats/components/room'

function fetchChatList() {
  return []
}

export default function Index() {
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

  return (
    <Layout>
      <Row>
        <Col w={4}>
          <Nav>
            <Search />
            <ChatList chats={chats} />
          </Nav>
        </Col>
        <Col w={8}>{chats.length && <Room {...chats[0]} />}</Col>
      </Row>
    </Layout>
  )
}
