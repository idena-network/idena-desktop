import React from 'react'
import { InviteProvider } from '../../shared/providers/invite-context'
import ContactsPage from '../../screens/contacts/components/contacts-page'

// eslint-disable-next-line react/display-name
export default function () {
  return (
    <InviteProvider>
      <ContactsPage />
    </InviteProvider>
  )
}
