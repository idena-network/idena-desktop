import React from 'react'
import {withRouter} from 'next/router'
import {rem} from 'polished'
import {FiShare, FiUserPlus, FiCamera} from 'react-icons/fi'
import Layout from '../../shared/components/layout'
import {Heading, Drawer, Box} from '../../shared/components'
import SendInviteForm from '../../screens/contacts/components/send-invite-form'
import theme from '../../shared/theme'
import {InviteProvider} from '../../shared/providers/invite-context'
import KillMe from '../../screens/dashboard/components/kill-me'
import Actions from '../../screens/dashboard/components/actions'
import IconLink from '../../shared/components/icon-link'
import ActivateInviteForm from '../../screens/dashboard/components/activate-invite-form'
import UserInfo from '../../screens/dashboard/components/user-info'
import NetProfile from '../../screens/dashboard/components/net-profile'

// eslint-disable-next-line react/prop-types
function Dashboard({router}) {
  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(false)

  const handleCloseSendInvite = () => setIsSendInviteOpen(false)

  return (
    <InviteProvider>
      <Layout>
        <Box
          px={theme.spacings.xxxlarge}
          py={theme.spacings.large}
          w={rem(700)}
        >
          <Heading>Profile</Heading>
          <Actions>
            <IconLink icon={<FiShare />}>Share</IconLink>
            <IconLink
              icon={<FiUserPlus />}
              onClick={() => setIsSendInviteOpen(true)}
            >
              Invite
            </IconLink>
            <IconLink href="/flips/new" icon={<FiCamera />}>
              Submit flip
            </IconLink>
          </Actions>
          <UserInfo />
          <NetProfile />
          <ActivateInviteForm />
          <KillMe />
        </Box>
        <Drawer show={isSendInviteOpen} onHide={handleCloseSendInvite}>
          <SendInviteForm
            onSuccess={() => {
              handleCloseSendInvite()
              router.push('/contacts')
            }}
            onFail={handleCloseSendInvite}
          />
        </Drawer>
      </Layout>
    </InviteProvider>
  )
}

export default withRouter(Dashboard)
