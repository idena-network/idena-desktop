import React, {useContext, useState} from 'react'
import {Layout} from '../components/layout'
import {
  ContactNav,
  ContactList,
  Actions,
  ContactSearch,
  ContactDetails,
  SendInviteForm,
} from '../components/contacts'
import {ContactContext} from '../providers'
import {Row, Col, Drawer} from '../components/atoms'
// eslint-disable-next-line import/no-named-as-default
import {sendInvite} from '../api'

export default () => {
  const contacts = useContext(ContactContext)
  const [showSendInviteForm, setSendInviteFormVisibility] = useState(false)
  const [inviteResult, setInviteResult] = useState()
  return (
    <Layout>
      <>
        <Row>
          <Col w={4}>
            <ContactNav>
              <ContactSearch />
              <Actions
                onInvite={() => {
                  setSendInviteFormVisibility(true)
                }}
              />
              <ContactList contacts={contacts} />
            </ContactNav>
          </Col>
          <Col w={8}>
            <ContactDetails fullName="optimusway" />
          </Col>
        </Row>
        <Drawer
          show={showSendInviteForm}
          onHide={() => setSendInviteFormVisibility(false)}
        >
          <SendInviteForm
            addr=""
            available={1000}
            inviteResult={inviteResult}
            onInviteSend={async (addr, amount) => {
              const invite = await sendInvite(addr, amount)
              setInviteResult(invite)

              const storedInvites =
                JSON.parse(localStorage.getItem('idena-invites-sent')) || []
              localStorage.setItem(
                'idena-invites-sent',
                JSON.stringify(storedInvites.concat(invite))
              )
            }}
          />
        </Drawer>
      </>
    </Layout>
  )
}
