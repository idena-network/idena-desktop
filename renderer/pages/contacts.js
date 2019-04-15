import React, {useContext, useState, useEffect} from 'react'
import {Layout} from '../components/layout'
import {
  ContactNav,
  ContactList,
  Actions,
  ContactSearch,
  ContactDetails,
  SendInviteForm,
} from '../components/contacts'
import {ContactContext, NetContext} from '../providers'
import {Row, Col, Drawer} from '../components/atoms'
import {sendInvite} from '../api'

export default () => {
  const contacts = useContext(ContactContext)
  const {addr, age, state: status, invites} = useContext(NetContext)
  const [showSendInviteForm, setSendInviteFormVisibility] = useState(false)
  const [inviteResult, setInviteResult] = useState()
  const [sentInvites, setInvites] = useState([])

  useEffect(() => {
    setInvites(
      JSON.parse(localStorage.getItem('idena-invites-sent')).map(
        ({receiver}) => ({fullName: receiver, status: 'Pending'})
      )
    )
  }, [])

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
              <ContactList
                remainingInvites={invites}
                sentInvites={sentInvites}
                contacts={contacts}
              />
            </ContactNav>
          </Col>
          <Col w={8}>
            <ContactDetails
              fullName="optimusway"
              address={addr}
              age={age}
              status={status}
            />
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
            onInviteSend={async (to, amount) => {
              const invite = await sendInvite(to, amount)
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
