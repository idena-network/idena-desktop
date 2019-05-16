import React, {useContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import Layout from '../../../components/layout'
import {
  ContactNav,
  ContactList,
  Actions,
  ContactSearch,
  SendInviteForm,
} from '../components'
import {sendInvite, fetchTx} from '../../../shared/api'
import {Row, Col, Drawer} from '../../../shared/components'
import DisplayInvite from '../components/display-invite'
import NetContext from '../../../shared/providers/net-provider'
import ContactContext from '../providers/contact-provider'

function ContactLayout({children}) {
  const savedContacts = useContext(ContactContext)
  const {invites: remainingInvites, identities} = useContext(NetContext)
  const [showSendInviteForm, setSendInviteFormVisibility] = useState(false)
  const [inviteResult, setInviteResult] = useState()
  const [sentInvites, setSentInvites] = useState([])
  const [selectedInvite, setSelectedInvite] = useState(null)
  const [showNewContactForm, toggleNewContactForm] = useState(false)
  const [contacts, setContacts] = useState(savedContacts)
  const [, setSelectedContact] = useState(null)

  useEffect(() => {
    if (savedContacts) {
      setContacts(
        savedContacts.map(c => {
          const id = identities && identities.find(i => i.address === c.addr)
          return {
            ...c,
            status: (id && id.state) || 'Undefined',
          }
        })
      )
    }
  }, [identities, savedContacts])

  useEffect(() => {
    const savedInvites =
      JSON.parse(localStorage.getItem('idena-invites-sent')) || []

    async function fetchTxs() {
      const txs = await Promise.all(savedInvites.map(({hash}) => fetchTx(hash)))
      const existingTxs = txs.filter(({tx}) => tx)

      const existingInvites = savedInvites.filter(
        ({hash}) => existingTxs.findIndex(tx => tx.hash === hash) > -1
      )

      setSentInvites(
        existingInvites.map(({hash, receiver}) => ({
          id: hash,
          to: receiver,
          fullName: receiver,
          status:
            (identities &&
              identities.find(i => i.address === receiver).state) ||
            'Fetching...',
        }))
      )
    }

    fetchTxs()
  }, [identities])

  return (
    <Layout>
      <>
        <Row>
          <Col w={4}>
            <ContactNav>
              <ContactSearch
                onNewContact={() => {
                  toggleNewContactForm(true)
                }}
              />
              <Actions
                onInvite={() => {
                  setSendInviteFormVisibility(true)
                }}
              />
              <ContactList
                remainingInvites={remainingInvites}
                sentInvites={sentInvites}
                contacts={contacts}
                onSelectInvite={id => {
                  setSelectedInvite(
                    sentInvites.find(invite => invite.id === id)
                  )
                }}
                onSelectContact={id => {
                  setSelectedContact(
                    contacts.find(contact => contact.addr === id)
                  )
                }}
              />
            </ContactNav>
          </Col>
          <Col w={8} p="1em">
            {children}
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
        <Drawer
          show={selectedInvite && selectedInvite.id}
          onHide={() => setSelectedInvite(null)}
        >
          <DisplayInvite {...selectedInvite} />
        </Drawer>
        <Drawer
          show={showNewContactForm}
          onHide={() => toggleNewContactForm(false)}
        />
      </>
    </Layout>
  )
}

ContactLayout.propTypes = {
  children: PropTypes.node,
}

export default ContactLayout
