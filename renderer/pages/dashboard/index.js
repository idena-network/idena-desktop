import React, {useState, useContext} from 'react'
import Layout from '../../components/layout'
import {Heading, Drawer, Box} from '../../shared/components'
import {
  UserActions,
  UserInfo,
  NetProfile,
  ActivateInviteForm,
} from '../../screens/dashboard/components'
import {activateInvite, sendInvite} from '../../shared/api'
import {SendInviteForm} from '../../screens/contacts/components'
import theme from '../../shared/theme'
import useCoinbaseAddress from '../../shared/utils/useCoinbaseAddress'
import useIdentity, {IdentityStatus} from '../../shared/utils/useIdentity'
import {NotificationContext} from '../../shared/providers/notification-provider'

export default () => {
  const address = useCoinbaseAddress()
  const identity = useIdentity(address)

  const {onAddNotification} = useContext(NotificationContext)

  const [showSendInvite, toggleSendInvite] = useState(false)

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large} w="600px">
        <Heading>Profile</Heading>
        <UserActions
          onSendInvite={() => toggleSendInvite(true)}
          canActivateInvite
        />
        <UserInfo {...identity} />
        <NetProfile {...identity} />
        {identity.canActivateInvite && (
          <ActivateInviteForm
            onActivate={async key => {
              const result = await activateInvite(address, key)
              onAddNotification({result})
            }}
          />
        )}
      </Box>
      <Drawer
        show={showSendInvite}
        onHide={() => {
          toggleSendInvite(false)
        }}
      >
        <SendInviteForm
          onSend={async (to, key) => {
            const result = await sendInvite(to, key)
            onAddNotification({result})
          }}
        />
      </Drawer>
    </Layout>
  )
}
