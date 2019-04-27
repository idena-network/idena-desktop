import React, {useState, useEffect} from 'react'
import Layout from '../../components/layout'
import {Row, Col} from '../../shared/components'
import {ChatNav, ChatSearch, ChatList, Room} from './components'

export default () => {
  const [chats, setChats] = useState([])

  useEffect(() => {
    setChats([])
  }, [])

  return (
    <Layout>
      <Row>
        <Col w={4}>
          <ChatNav>
            <ChatSearch />
            <ChatList chats={chats} />
          </ChatNav>
        </Col>
        <Col w={8}>{chats.length && <Room {...chats[0]} />}</Col>
      </Row>
    </Layout>
  )
}
