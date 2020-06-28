import React from 'react'
import { withRouter } from 'next/router'
import ContactsPage from '../../screens/contacts/components/contacts-page'
import { InviteProvider } from '../../shared/providers/invite-context'

// eslint-disable-next-line react/prop-types
function NewInvite() {
  return (
    <InviteProvider>
      <ContactsPage showNewInviteForm />
    </InviteProvider>
  )
}

export default withRouter(NewInvite)
