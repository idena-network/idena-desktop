import React from 'react'
import PropTypes from 'prop-types'
import {Box, Drawer} from '../../../shared/components'
import Layout from '../../../shared/components/layout'
import Flex from '../../../shared/components/flex'
import ContactDetails from './contact-details'
import {ContactProvider} from '../../../shared/providers/contact-context'
import Sidebar from './sidebar'
import SendInviteForm from './send-invite-form'
import {InviteProvider} from '../../../shared/providers/invite-context'
import InviteDetails from './invite-details'
import Actions from '../../../shared/components/actions'
import {FiShare, FiUserPlus} from 'react-icons/fi'
import IconLink from '../../../shared/components/icon-link'



function ContactsPage( {showNewInvite=false}, ...props) {

  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact, setShowContact] = React.useState(false)

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(showNewInvite)
  const handleCloseSendInvite = () => setIsSendInviteOpen(false)


  return (
    <InviteProvider>
      <ContactProvider>

        <Layout>

          <Actions>
            <IconLink
              icon={<FiUserPlus />}
              onClick={() => setIsSendInviteOpen(true)}
            >
              Invite
            </IconLink>
          </Actions>

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
                onSuccess={() => {
                  handleCloseSendInvite()
                  router.push('/contacts')
                }}
                onFail={handleCloseSendInvite}
              />
            </Drawer>

          </Flex>
        </Layout>
      </ContactProvider>
    </InviteProvider>

  )

}


ContactsPage.propTypes = {
  showNewInvite: PropTypes.bool,
}


export default ContactsPage