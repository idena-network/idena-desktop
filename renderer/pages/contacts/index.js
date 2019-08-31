import React from 'react'
import {InviteProvider} from '../../shared/providers/invite-context'
import ContactsPage from '../../screens/contacts/components/contacts-page'

export default function() {
  return (
    <InviteProvider>
      <ContactsPage />
    </InviteProvider>
  )
}