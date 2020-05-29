import React, {useReducer} from 'react'
import {useRouter} from 'next/router'
import {rem} from 'polished'
import {useTranslation} from 'react-i18next'
import {State} from 'xstate'
import dayjs from 'dayjs'
import Layout from '../../shared/components/layout'
import {Drawer, Box, PageTitle, Absolute} from '../../shared/components'
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
import {
  useIdentityState,
  IdentityStatus,
} from '../../shared/providers/identity-context'
import {Notification} from '../../shared/components/notifications'
import {NotificationType} from '../../shared/providers/notification-context'
import {usePersistence} from '../../shared/hooks/use-persistent-state'
import {useEpochState} from '../../shared/providers/epoch-context'
import {loadPersistentState} from '../../shared/utils/persist'
import {loadValidationState} from '../../screens/validation/machine'

function Dashboard() {
  const router = useRouter()
  const {syncing, offline, loading} = useChainState()

  const [isSendInviteOpen, setIsSendInviteOpen] = React.useState(false)
  const handleCloseSendInvite = () => setIsSendInviteOpen(false)

  const [isWithdrawStakeFormOpen, setIsWithdrawStakeFormOpen] = React.useState(
    false
  )
  const handleCloseWithdrawStakeForm = () => setIsWithdrawStakeFormOpen(false)

  const {
    address,
    state,
    canTerminate,
    invites: invitesCount,
  } = useIdentityState()
  const isValidationSucceeded = [
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Human,
  ].includes(state)

  const {t} = useTranslation()

  const [validationResultsEvidence, dispatchEvidence] = usePersistence(
    useReducer(
      // eslint-disable-next-line no-shadow
      (state, action) => ({...state, ...action}),
      loadPersistentState('validationResults') || {}
    ),
    'validationResults'
  )

  const epoch = useEpochState()

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

        {epoch &&
          shouldSeeValidationResults(
            epoch.epoch,
            validationResultsEvidence
          ) && (
            <Absolute bottom={0} left={0} right={0}>
              <Notification
                pinned
                type={NotificationType.Info}
                title={
                  isValidationSucceeded
                    ? t(
                        'See your validation rewards in the blockchain explorer'
                      )
                    : t(
                        'See your validation results in the blockchain explorer'
                      )
                }
                action={() => {
                  dispatchEvidence({[epoch.epoch]: true})
                  global.openExternal(
                    `https://scan.idena.io/${
                      isValidationSucceeded ? 'reward' : 'answers'
                    }?epoch=${epoch.epoch}&identity=${address}`
                  )
                }}
                actionName={t('Open')}
              ></Notification>
            </Absolute>
          )}
      </Layout>
    </InviteProvider>
  )
}

function shouldSeeValidationResults(currentEpoch, evidence) {
  const validationStateDefinition = loadValidationState()
  if (validationStateDefinition) {
    const {
      done,
      context: {
        epoch,
        validationStart,
        shortSessionDuration,
        longSessionDuration,
      },
    } = State.create(validationStateDefinition)
    return done &&
      currentEpoch - epoch === 1 &&
      dayjs().diff(
        dayjs(validationStart)
          .add(shortSessionDuration, 's')
          .add(longSessionDuration, 's'),
        'm'
      ) >= 1
      ? !evidence[currentEpoch]
      : false
  }
  return false
}

export default Dashboard
