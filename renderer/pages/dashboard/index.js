import React from 'react'
import {useRouter} from 'next/router'
import {rem} from 'polished'
import {useTranslation} from 'react-i18next'

import Layout from '../../shared/components/layout'
import {Drawer, Box, PageTitle} from '../../shared/components'
import SendInviteForm from '../../screens/contacts/components/send-invite-form'
import theme from '../../shared/theme'
import {InviteProvider} from '../../shared/providers/invite-context'
import Actions from '../../shared/components/actions'
import MinerStatusSwitcher from '../../screens/dashboard/components/miner-status-switcher'
import IconLink from '../../shared/components/icon-link'
import ActivateInviteForm from '../../screens/dashboard/components/activate-invite-form'
import UserInfo from '../../screens/dashboard/components/user-info'
import {NetProfile} from '../../screens/dashboard/components/net-profile'
import {useChainState} from '../../shared/providers/chain-context'
import KillForm from '../../screens/wallets/components/kill-form'
import {useIdentityState} from '../../shared/providers/identity-context'

function Dashboard() {
  const router = useRouter()
  const {syncing, offline, loading} = useChainState()

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(false)
  const handleCloseSendInvite = () => setIsSendInviteOpen(false)

  const [isWithdrawStakeFormOpen, setIsWithdrawStakeFormOpen] = React.useState(
    false
  )
  const handleCloseWithdrawStakeForm = () => setIsWithdrawStakeFormOpen(false)

  const {canTerminate, invites: invitesCount} = useIdentityState()

  const {t} = useTranslation()

  return (
    <InviteProvider>
      <Layout syncing={syncing} offline={offline} loading={loading}>
        <Box
          px={theme.spacings.xxxlarge}
          py={theme.spacings.large}
          w={rem(700, theme.fontSizes.base)}
        >
          <PageTitle>{t('Profile')}</PageTitle>
          <Actions>
            <IconLink
              disabled={invitesCount === 0}
              href="/contacts/new-invite"
              icon={<i className="icon icon--add_contact" />}
            >
              {t('Invite')}
            </IconLink>
            <IconLink
              href="/flips/new"
              icon={<i className="icon icon--photo" />}
            >
              {t('New flip')}
            </IconLink>
            <IconLink
              icon={<i className="icon icon--delete" />}
              disabled={!canTerminate}
              onClick={() => {
                setIsWithdrawStakeFormOpen(!isWithdrawStakeFormOpen)
              }}
            >
              {t('Terminate')}
            </IconLink>
          </Actions>
          <UserInfo />
          <MinerStatusSwitcher />
          <NetProfile />
          <ActivateInviteForm />
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

        <Drawer
          show={isWithdrawStakeFormOpen}
          onHide={handleCloseWithdrawStakeForm}
        >
          <KillForm
            onSuccess={handleCloseWithdrawStakeForm}
            onFail={handleCloseWithdrawStakeForm}
          />
        </Drawer>
      </Layout>
    </InviteProvider>
  )
}

export default Dashboard
