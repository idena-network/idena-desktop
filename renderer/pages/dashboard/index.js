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
import useIdentity from '../../shared/utils/useIdentity'
import {
  NotificationContext,
  NotificationType,
} from '../../shared/providers/notification-provider'

export default () => {
  const address = useCoinbaseAddress()
  const identity = useIdentity(address)

  const {addNotification} = useContext(NotificationContext)

  const [isSendInviteOpen, setIsSendInviteOpen] = useState(false)
  const [inviteResult, setInviteResult] = useState()

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large} w="600px">
        <Heading>Profile</Heading>
        <UserActions
          onSendInvite={() => setIsSendInviteOpen(true)}
          canActivateInvite
        />
        <UserInfo {...identity} />
        <NetProfile {...identity} />
        {identity.canActivateInvite && (
          <ActivateInviteForm
            onActivate={async key => {
              const {result, error} = await activateInvite(address, key)
              addNotification({
                title: `Activation ${result ? 'succeeded' : 'failed'}`,
                body: result || error.message,
                type: result ? NotificationType.Info : NotificationType.Error,
              })
            }}
          />
        )}
      </Box>
      <Drawer
        show={isSendInviteOpen}
        onHide={() => {
          setIsSendInviteOpen(false)
        }}
      >
        <SendInviteForm
          onSend={async (to, key) => {
            const {result, error} = await sendInvite(to, key)
            if (result) {
              setInviteResult(result)
            } else {
              setInviteResult(error.message)
            }
          }}
          result={inviteResult}
        />
      </Drawer>
    </Layout>
  )
}
