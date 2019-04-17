import React, {useContext} from 'react'
import {Layout} from '../components/layout'
import {ChatList, ChatSearch, Room, ChatNav} from '../components/chats'
import {ChatContext} from '../providers'
import {Row, Col} from '../shared/components'

export default () => {
  const chats = useContext(ChatContext)
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
