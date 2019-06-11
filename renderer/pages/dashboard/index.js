import React, {useState} from 'react'
import {rem} from 'polished'
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

export default () => {
  const address = useCoinbaseAddress()
  const identity = useIdentity(address)

  const [activateResult, setActivateResult] = useState()
  const [inviteResult, setInviteResult] = useState()

  const [showSendInvite, toggleSendInvite] = useState(false)
  const [showActivateInvite, toggleActivateInvite] = useState(false)

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large} w="600px">
        <Heading>Profile</Heading>
        <UserActions
          onToggleSendInvite={() => toggleSendInvite(true)}
          canActivateInvite
          onToggleActivateInvite={() => toggleActivateInvite(true)}
        />
        <UserInfo {...identity} />
        <NetProfile {...identity} />
      </Box>
      <Drawer
        show={showActivateInvite}
        onHide={() => {
          toggleActivateInvite(false)
        }}
      >
        <ActivateInviteForm
          to={address}
          activateResult={activateResult}
          onActivateInviteSend={async (to, key) => {
            const result = await activateInvite(to, key)
            setActivateResult({result})
          }}
        />
      </Drawer>
      <Drawer
        show={showSendInvite}
        onHide={() => {
          toggleSendInvite(false)
        }}
      >
        <SendInviteForm
          inviteResult={inviteResult}
          onInviteSend={async (to, key) => {
            const result = await sendInvite(to, key)
            setInviteResult({result})
          }}
        />
      </Drawer>
    </Layout>
  )
}
