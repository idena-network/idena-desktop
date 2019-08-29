import React from 'react'
import {Box, Drawer} from '../../shared/components'
import Layout from '../../shared/components/layout'
import Flex from '../../shared/components/flex'
import ContactDetails from '../../screens/contacts/components/contact-details'
import {ContactProvider} from '../../shared/providers/contact-context'
import Sidebar from '../../screens/contacts/components/sidebar'
import SendInviteForm from '../../screens/contacts/components/send-invite-form'
import {InviteProvider} from '../../shared/providers/invite-context'
import InviteDetails from '../../screens/contacts/components/invite-details'
import {FiShare, FiUserPlus} from 'react-icons/fi'
import IconLink from '../../shared/components/icon-link'
import ContactsPage from '../../screens/contacts/components/contacts-page'



export default function() {

  return (

    <InviteProvider>
        <ContactsPage />
    </InviteProvider>
  )
}


