import React, {useState, useContext} from 'react'
import Layout from '../../components/layout'
import {Heading, Drawer, Box} from '../../shared/components'
import {
  UserActions,
  UserInfo,
  NetProfile,
  ActivateInviteForm,
} from '../../screens/dashboard/components'
import {SendInviteForm} from '../../screens/contacts/components'
import theme from '../../shared/theme'
import useCoinbaseAddress from '../../shared/utils/useCoinbaseAddress'
import useIdentity from '../../shared/utils/useIdentity'
import {
  NotificationContext,
  NotificationType,
} from '../../shared/providers/notification-provider'
import {InviteProvider} from '../../shared/providers/invite-context'
import {IdentityProvider} from '../../shared/providers/identity-context'

export default () => {
  const address = useCoinbaseAddress()
  const identity = useIdentity(address)

  const {addNotification} = useContext(NotificationContext)
  const [isSendInviteOpen, setIsSendInviteOpen] = useState(false)

  if (!address) {
    return null
  }

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large} w="600px">
        <Heading>Profile</Heading>
        <UserActions
          onSendInvite={() => setIsSendInviteOpen(true)}
          canActivateInvite
        />
        <UserInfo {...identity} />
        <InviteProvider>
          <IdentityProvider address={address}>
            <NetProfile {...identity} />
          </IdentityProvider>
        </InviteProvider>

        <InviteProvider>
          <IdentityProvider address={address}>
            <ActivateInviteForm
              onFail={({message}) =>
                addNotification({
                  title: message,
                  type: NotificationType.Error,
                })
              }
            />
          </IdentityProvider>
        </InviteProvider>
      </Box>
      <Drawer
        show={isSendInviteOpen}
        onHide={() => {
          setIsSendInviteOpen(false)
        }}
      >
        <InviteProvider>
          <SendInviteForm
            onFail={({message}) =>
              addNotification({title: message, type: NotificationType.Error})
            }
          />
        </InviteProvider>
      </Drawer>
    </Layout>
  )
}
