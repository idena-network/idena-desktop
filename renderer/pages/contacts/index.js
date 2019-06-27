import React from 'react'
import {Box, Drawer} from '../../shared/components'
import Layout from '../../components/layout'
import Flex from '../../shared/components/flex'
import {ContactDetails} from '../../screens/contacts/components'
import {ContactProvider} from '../../shared/providers/contact-context'
import Sidebar from '../../screens/contacts/components/sidebar'
import DisplayInvite from '../../screens/contacts/components/display-invite'
import {InviteProvider} from '../../shared/providers/invite-context'

export default function() {
  const [selectedContact, setSelectedContact] = React.useState(null)
  const [selectedInvite, setSelectedInvite] = React.useState(null)
  const [showInvite, setShowInvite] = React.useState(false)

  return (
    <InviteProvider>
      <ContactProvider>
        <Layout>
          <Flex>
            <Sidebar
              onSelectContact={setSelectedContact}
              onSelectInvite={invite => {
                setShowInvite(true)
                setSelectedInvite(invite)
              }}
            />
            <Box>
              <ContactDetails {...selectedContact} />
            </Box>
          </Flex>
          <Drawer
            show={showInvite}
            onHide={() => {
              setShowInvite(false)
            }}
          >
            <DisplayInvite
              {...selectedInvite}
              code={selectedInvite && selectedInvite.key}
            />
          </Drawer>
        </Layout>
      </ContactProvider>
    </InviteProvider>
  )
}
