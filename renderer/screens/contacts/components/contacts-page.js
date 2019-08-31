import React from 'react'
import PropTypes from 'prop-types'
import {Box, Drawer} from '../../../shared/components'
import Layout from '../../../shared/components/layout'
import Flex from '../../../shared/components/flex'
import ContactDetails from './contact-details'
import {ContactProvider} from '../../../shared/providers/contact-context'
import Sidebar from './sidebar'
import SendInviteForm from './send-invite-form'
import InviteDetails from './invite-details'
import {useInviteState} from '../../../shared/providers/invite-context'

function ContactsPage( {showNewInviteForm=false}, ...props) {
  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact, setShowContact] = React.useState(false)

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(showNewInviteForm)
  const handleCloseSendInvite = (invite) => {
    setIsSendInviteOpen(false)
  }

  const {invites} = useInviteState()

  React.useEffect(() => {
    if ((selectedInvite==null) && invites.length) {
      setSelectedInvite(invites[0])
      setShowInvite(true)
    }
  }, [invites, setSelectedInvite])


  return (
    <ContactProvider>
      <Layout>
        <Flex>
          <Sidebar
            onSelectContact={setSelectedContact}
            onSelectInvite={invite => {
              setSelectedInvite(invite)
              setShowInvite(true)
            }}
          />

          <Box>
            {showInvite && (
              <InviteDetails
                {...selectedInvite}
                code={selectedInvite && selectedInvite.key}
              />
            )}

            {showContact && (
              <ContactDetails
                {...selectedContact}
              />
            )}
          </Box>

          <Drawer show={isSendInviteOpen} onHide={handleCloseSendInvite}>
            <SendInviteForm
              onSuccess={(invite) => {
                handleCloseSendInvite()
                setSelectedInvite(invite)
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