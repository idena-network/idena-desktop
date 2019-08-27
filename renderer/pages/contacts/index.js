import React from 'react'
import {Box, Drawer} from '../../shared/components'
import Layout from '../../shared/components/layout'
import Flex from '../../shared/components/flex'
import ContactDetails from '../../screens/contacts/components/contact-details'
import {ContactProvider} from '../../shared/providers/contact-context'
import Sidebar from '../../screens/contacts/components/sidebar'
//import DisplayInvite from '../../screens/contacts/components/display-invite'
import {InviteProvider} from '../../shared/providers/invite-context'
import InviteDetails from '../../screens/contacts/components/invite-details'


export default function() {
  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)
  const [showContact, setShowContact] = React.useState(false)


  return (
    <InviteProvider>
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
          </Flex>
        </Layout>
      </ContactProvider>
    </InviteProvider>
  )
}
