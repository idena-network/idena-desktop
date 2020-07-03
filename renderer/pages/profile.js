import React from 'react'
import {Stack, Box, Text, Icon, useDisclosure, useToast} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {Page, PageTitle} from '../screens/app/components'
import {
  UserCard,
  SimpleUserStat,
  UserStatList,
  UserStat,
  UserStatLabel,
  UserStatValue,
  AnnotatedUserStat,
  SpoilInviteDrawer,
  SpoilInviteForm,
} from '../screens/profile/components'
import {IconButton2} from '../shared/components/button'
import {IconLink} from '../shared/components/link'
import Layout from '../shared/components/layout'
import {IdentityStatus} from '../shared/types'
import {useChainState} from '../shared/providers/chain-context'
import {toPercent, toLocaleDna, callRpc} from '../shared/utils/utils'
import MinerStatusSwitcher from '../screens/dashboard/components/miner-status-switcher'
import {Toast} from '../shared/components/components'
import KillForm, {
  KillIdentityDrawer,
} from '../screens/wallets/components/kill-form'
import {
  shouldExpectValidationResults,
  hasPersistedValidationResults,
} from '../screens/validation/utils'
import {persistItem} from '../shared/utils/persist'
import {ValidationResultToast} from '../screens/dashboard/components/validation-results'
import ActivateInviteForm from '../screens/dashboard/components/activate-invite-form'
import {InviteProvider} from '../shared/providers/invite-context'
import {rem} from '../shared/theme'

export default function ProfilePage() {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const {
    isOpen: isOpenKillForm,
    onOpen: onOpenKillForm,
    onClose: onCloseKillForm,
  } = useDisclosure()

  const {
    isOpen: isOpenSpoilForm,
    onOpen: onOpenSpoilForm,
    onClose: onCloseSpoilForm,
  } = useDisclosure()

  const toast = useToast()

  const {syncing, offline} = useChainState()

  const {
    address,
    state,
    balance,
    stake,
    penalty,
    age,
    totalShortFlipPoints,
    totalQualifiedFlips,
    canTerminate,
    invites: invitesCount,
    canMine,
  } = useIdentityState()

  const epoch = useEpochState()

  const [showValidationResults, setShowValidationResults] = React.useState()

  React.useEffect(() => {
    if (epoch && shouldExpectValidationResults(epoch.epoch)) {
      const {epoch: epochNumber} = epoch
      if (hasPersistedValidationResults(epochNumber)) {
        setShowValidationResults(true)
      } else {
        persistItem('validationResults', epochNumber, {
          epochStart: new Date().toISOString(),
        })
        setShowValidationResults(hasPersistedValidationResults(epochNumber))
      }
    }
  }, [epoch])

  const toDna = toLocaleDna(language)

  return (
    <InviteProvider>
      <Layout syncing={syncing} offline={offline}>
        <Page>
          <PageTitle mb={8}>{t('Profile')}</PageTitle>
          <Stack isInline spacing={10}>
            <Stack spacing={6}>
              <UserCard address={address} state={state} />
              <UserStatList>
                <SimpleUserStat label="Address" value={address} />
                <UserStat>
                  <UserStatLabel>{t('Balance')}</UserStatLabel>
                  <UserStatValue>{toDna(balance)}</UserStatValue>
                </UserStat>
                {stake > 0 && state === IdentityStatus.Newbie && (
                  <>
                    <AnnotatedUserStat
                      annotation={t(
                        'You need to get Verified status to be able to terminate your identity and withdraw the stake'
                      )}
                      label={t('Stake')}
                      value={toDna(stake * 0.25)}
                    />
                    <AnnotatedUserStat
                      annotation={t(
                        'You need to get Verified status to get the locked funds into the normal wallet'
                      )}
                      label={t('Locked')}
                      value={toDna(stake * 0.75)}
                    />
                  </>
                )}

                {stake > 0 && state !== IdentityStatus.Newbie && (
                  <AnnotatedUserStat
                    annotation={t(
                      'In order to withdraw the stake you have to terminate your identity'
                    )}
                    label={t('Stake')}
                    value={toDna(stake)}
                  />
                )}

                {penalty > 0 && (
                  <AnnotatedUserStat
                    annotation={t(
                      "Your node was offline more than 1 hour. The penalty will be charged automaically. Once it's fully paid you'll continue to mine coins."
                    )}
                    label={t('Mining penalty')}
                    value={toDna(penalty)}
                  />
                )}
                {age > 0 && <SimpleUserStat label="Age" value={age} />}
                {epoch && (
                  <SimpleUserStat
                    label="Next validation"
                    value={dayjs(epoch.nextValidation).toString()}
                  />
                )}
                {totalQualifiedFlips > 0 && (
                  <AnnotatedUserStat
                    annotation={t('Total score for all validations')}
                    label={t('Total score')}
                  >
                    <UserStatValue>
                      {totalShortFlipPoints} out of {totalQualifiedFlips} (
                      {toPercent(totalShortFlipPoints / totalQualifiedFlips)})
                    </UserStatValue>
                  </AnnotatedUserStat>
                )}
              </UserStatList>
              <ActivateInviteForm />
            </Stack>
            <Box w={rem(200)}>
              {canMine && (
                <Text fontWeight={500} mt={4} mb={2}>
                  {t('Online mining status')}
                </Text>
              )}
              <MinerStatusSwitcher />
              <Stack mt={canMine ? 0 : rem(104)} spacing={1} align="flex-start">
                <IconLink
                  href="/contacts/new-invite"
                  isDisabled={invitesCount === 0}
                  icon="add-user"
                >
                  {t('Invite')}
                </IconLink>
                <IconLink
                  href="/flips/new"
                  icon={<Icon name="photo" size={5} />}
                >
                  {t('New flip')}
                </IconLink>
                <IconButton2 icon="poo" onClick={onOpenSpoilForm}>
                  {t('Spoil invite')}
                </IconButton2>
                <IconButton2
                  isDisabled={!canTerminate}
                  icon="delete"
                  onClick={onOpenKillForm}
                >
                  {t('Terminate')}
                </IconButton2>
              </Stack>
            </Box>
          </Stack>

          <KillIdentityDrawer
            address={address}
            isOpen={isOpenKillForm}
            onClose={onCloseKillForm}
          >
            <KillForm onSuccess={onCloseKillForm} onFail={onCloseKillForm} />
          </KillIdentityDrawer>

          <SpoilInviteDrawer
            isOpen={isOpenSpoilForm}
            onClose={onCloseSpoilForm}
          >
            <SpoilInviteForm
              onSpoil={async key => {
                try {
                  await callRpc('dna_activateInviteToRandAddr', {key})

                  toast({
                    status: 'success',
                    // eslint-disable-next-line react/display-name
                    render: () => (
                      <Toast title={t('Invitation is successfully spoiled')} />
                    ),
                  })
                  onCloseSpoilForm()
                } catch {
                  toast({
                    // eslint-disable-next-line react/display-name
                    render: () => (
                      <Toast
                        title={t('Invitation is missing')}
                        status="error"
                      />
                    ),
                  })
                }
              }}
            />
          </SpoilInviteDrawer>

          {showValidationResults && (
            <ValidationResultToast epoch={epoch.epoch} />
          )}
        </Page>
      </Layout>
    </InviteProvider>
  )
}
