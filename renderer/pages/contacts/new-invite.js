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
function NewInvite({router}) {


  const handleClose = () => {
    addNotification({
      title: 'Flip has been saved to drafts',
    })
  }

  return (
    <InviteProvider>
        <ContactsPage showNewInviteForm={true}/>
    </InviteProvider>
  )



//router.push('/contacts')

/*

  const {addNotification} = useNotificationDispatch()

  const [id] = useState(nanoid())

  const handleClose = () => {
    addNotification({
      title: 'Flip has been saved to drafts',
    })
    router.push('/contacts')
  }

  return (
    <Layout>
      <Box px={rem(theme.spacings.large)} py={rem(theme.spacings.medium24)}>
        <Flex align="center" justify="space-between">
          <Heading margin={0}>New flip</Heading>
          <IconClose onClick={handleClose} />
        </Flex>
        <FlipMaster id={id} onClose={handleClose} />
      </Box>
    </Layout>
  )

*/


}

export default withRouter(NewInvite)
