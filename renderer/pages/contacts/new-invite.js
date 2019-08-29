import React, {useState} from 'react'
import nanoid from 'nanoid'
import {rem} from 'polished'
import {withRouter} from 'next/router'
import {Heading, Box, IconClose} from '../../shared/components'
import FlipMaster from '../../screens/flips/components/flip-master'
import Layout from '../../shared/components/layout'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import ContactsPage from '../../screens/contacts/components/contacts-page'
import {InviteProvider} from '../../shared/providers/invite-context'

// eslint-disable-next-line react/prop-types
function NewInvite() {
  return (
    <InviteProvider>
      <ContactsPage showNewInviteForm />
    </InviteProvider>
  )
}

export default withRouter(NewInvite)
