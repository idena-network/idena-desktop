import React, {useContext, useState} from 'react'
import {Layout} from '../components/layout'
import {
  ContactNav,
  ContactList,
  Actions,
  ContactSearch,
  ContactDetails,
} from '../components/contacts'
import {ContactContext} from '../providers'
import {Row, Col} from '../components/atoms'
// eslint-disable-next-line import/no-named-as-default
import InviteDrawer from '../components/contacts/invite-drawer'
import {sendInvite} from '../api'

export default () => {
  const contacts = useContext(ContactContext)
  const [showDrawer, setDrawerState] = useState(false)
  const [inviteData, setInviteData] = useState()
  return (
    <Layout>
      <>
        <Row>
          <Col w={4}>
            <ContactNav>
              <ContactSearch />
              <Actions
                onInvite={() => {
                  setDrawerState(true)
                }}
              />
              <ContactList contacts={contacts} />
            </ContactNav>
          </Col>
          <Col w={8}>
            <ContactDetails {...contacts[0]} />
          </Col>
        </Row>
        <InviteDrawer
          show={showDrawer}
          addr=""
          available={1000}
          onInviteSend={async (addr, amount) => {
            const resp = await sendInvite(addr, amount)
            setInviteData(resp)
          }}
          onInviteClose={() => setDrawerState(false)}
          inviteData={inviteData}
        />
      </>
    </Layout>
  )
}
