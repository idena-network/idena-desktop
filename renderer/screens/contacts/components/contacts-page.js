import React from 'react'
import PropTypes from 'prop-types'
import {FiUsers} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {Box, Drawer, Placeholder} from '../../../shared/components'
import Layout from '../../../shared/components/layout'
import Flex from '../../../shared/components/flex'
import ContactDetails from './contact-details'
import {ContactProvider} from '../../../shared/providers/contact-context'
import Sidebar from './sidebar'
import SendInviteForm from './send-invite-form'
import InviteDetails from './invite-details'
import {useChainState} from '../../../shared/providers/chain-context'

function ContactsPage({showNewInviteForm = false}) {
  const {t} = useTranslation()

  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact] = React.useState(false)

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(
    showNewInviteForm
  )
  const handleCloseSendInvite = () => {
    setIsSendInviteOpen(false)
  }

  const {syncing, offline, loading} = useChainState()

  return (
    <ContactProvider>
      <Layout syncing={syncing} offline={offline} loading={loading}>
        <Flex>
          <Sidebar
            onSelectContact={setSelectedContact}
            onSelectInvite={invite => {
              setSelectedInvite(invite)
              setShowInvite(true)
            }}
            onNewInvite={() => setIsSendInviteOpen(true)}
          />
          <Box
            css={{
              flexBasis: 0,
              flexGrow: 1,
              maxWidth: '100%',
            }}
          >
            {showInvite && (
              <InviteDetails
                dbkey={selectedInvite.id}
                code={selectedInvite && selectedInvite.key}
                onClose={() => {
                  setShowInvite(false)
                  setSelectedInvite(null)
                }}
                onSelect={invite => {
                  setShowInvite(true)
                  setSelectedInvite(invite)
                }}
              />
            )}

            {showContact && <ContactDetails {...selectedContact} />}

            {!showContact && !showInvite && !selectedInvite && (
              <Placeholder
                icon={<FiUsers />}
                text={
                  <>
                    {t('You haven’t selected contacts yet.')} <br />
                  </>
                }
              />
            )}
          </Box>

          <Drawer show={isSendInviteOpen} onHide={handleCloseSendInvite}>
            <SendInviteForm
              onSuccess={invite => {
                handleCloseSendInvite()
                setSelectedInvite(invite)
                setShowInvite(true)
              }}
              onFail={handleCloseSendInvite}
            />
          </Drawer>
        </Flex>
      </Layout>
    </ContactProvider>
  )
}

ContactsPage.propTypes = {
  showNewInviteForm: PropTypes.bool,
}

export default ContactsPage
