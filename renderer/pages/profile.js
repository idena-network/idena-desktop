import React from 'react'
import {
  Stack,
  Text,
  Icon,
  useDisclosure,
  useToast,
  Flex,
  PopoverTrigger,
  Box,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  useIdentityState,
  mapToFriendlyStatus,
} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {Page, PageTitle} from '../screens/app/components'
import {
  UserInlineCard,
  SimpleUserStat,
  UserStatList,
  UserStatValue,
  AnnotatedUserStat,
  SpoilInviteDrawer,
  SpoilInviteForm,
  MinerStatusSwitcher,
  ActivateInviteForm,
  ValidationResultToast,
  UserStat,
  UserStatLabel,
} from '../screens/profile/components'
import {PrimaryButton, IconButton2} from '../shared/components/button'
import Layout from '../shared/components/layout'
import {IconLink} from '../shared/components/link'
import {IdentityStatus, OnboardingStep} from '../shared/types'
import {
  toPercent,
  toLocaleDna,
  callRpc,
  eitherState,
} from '../shared/utils/utils'
import {ExternalLink, Toast} from '../shared/components/components'
import KillForm, {
  KillIdentityDrawer,
} from '../screens/wallets/components/kill-form'
import {
  shouldExpectValidationResults,
  hasPersistedValidationResults,
} from '../screens/validation/utils'
import {persistItem} from '../shared/utils/persist'
import {InviteProvider} from '../shared/providers/invite-context'
import {rem} from '../shared/theme'
import {useChainState} from '../shared/providers/chain-context'
import {
  OnboardingPopover,
  OnboardingPopoverContent,
  OnboardingPopoverContentIconRow,
  TaskConfetti,
} from '../shared/components/onboarding'
import {useOnboarding} from '../shared/providers/onboarding-context'
import {
  doneOnboardingStep,
  activeShowingOnboardingStep,
  onboardingStep,
} from '../shared/utils/onboarding'

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
    state: status,
    balance,
    stake,
    penalty,
    age,
    totalShortFlipPoints,
    totalQualifiedFlips,
    invites: invitesCount,
    canTerminate,
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

  const [currentOnboarding, {done, dismiss, next}] = useOnboarding()

  React.useEffect(() => {
    // console.log('entering effect', {state: currentOnboarding.value})
    if (
      status === IdentityStatus.Candidate &&
      eitherState(
        currentOnboarding,
        onboardingStep(OnboardingStep.ActivateInvite)
      ) &&
      !eitherState(
        currentOnboarding,
        'idle',
        doneOnboardingStep(OnboardingStep.ActivateInvite)
      )
    ) {
      // console.log('bumping done')
      done()
      // console.log('bumping done DONE', {state: currentOnboarding.value})
    }
  }, [currentOnboarding, done, next, status])

  const isShowingActivateInvitePopover = currentOnboarding.matches(
    activeShowingOnboardingStep(OnboardingStep.ActivateInvite)
  )

  const toDna = toLocaleDna(language)

  return (
    <InviteProvider>
      <Layout syncing={syncing} offline={offline}>
        <Page>
          <PageTitle mb={8}>{t('Profile')}</PageTitle>
          <Stack isInline spacing={10}>
            <Stack spacing={6} w="md">
              <UserInlineCard address={address} status={status} h={24} />

              <UserStatList>
                <UserStat>
                  <UserStatLabel>{t('Address')}</UserStatLabel>
                  <UserStatValue>{address}</UserStatValue>
                  <ExternalLink
                    href={`https://scan.idena.io/address/${address}`}
                  >
                    {t('Open in blockhain explorer')}
                  </ExternalLink>
                </UserStat>

                {status === IdentityStatus.Newbie ? (
                  <AnnotatedUserStat
                    annotation={t(
                      'Solve more than 12 flips to become Verified'
                    )}
                    label={t('Status')}
                    value={mapToFriendlyStatus(status)}
                  />
                ) : (
                  <SimpleUserStat
                    label={t('Status')}
                    value={mapToFriendlyStatus(status)}
                  />
                )}

                <SimpleUserStat label={t('Balance')} value={toDna(balance)} />

                {stake > 0 && status === IdentityStatus.Newbie && (
                  <Stack spacing={4}>
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
                  </Stack>
                )}

                {stake > 0 && status !== IdentityStatus.Newbie && (
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
                      "Your node was offline more than 1 hour. The penalty will be charged automatically. Once it's fully paid you'll continue to mine coins."
                    )}
                    label={t('Mining penalty')}
                    value={toDna(penalty)}
                  />
                )}

                {age > 0 && <SimpleUserStat label={t('Age')} value={age} />}

                {epoch && (
                  <SimpleUserStat
                    label={t('Next validation')}
                    value={new Date(epoch.nextValidation).toLocaleString()}
                  />
                )}

                {totalQualifiedFlips > 0 && (
                  <AnnotatedUserStat
                    annotation={t('Total score for all validations')}
                    label={t('Total score')}
                  >
                    <UserStatValue>
                      {Math.min(totalShortFlipPoints, totalQualifiedFlips)} out
                      of {totalQualifiedFlips} (
                      {toPercent(
                        Math.min(totalShortFlipPoints / totalQualifiedFlips, 1)
                      )}
                      )
                    </UserStatValue>
                  </AnnotatedUserStat>
                )}
              </UserStatList>

              <OnboardingPopover
                isOpen={isShowingActivateInvitePopover}
                placement="top-start"
              >
                <PopoverTrigger>
                  <ActivateInviteForm zIndex={2} />
                </PopoverTrigger>
                <OnboardingPopoverContent
                  title={t('Enter invitation code')}
                  zIndex={2}
                  onDismiss={dismiss}
                >
                  <Stack spacing={5}>
                    <Stack>
                      <Text>
                        {t(
                          `An invitation can be provided by validated participants.`
                        )}
                      </Text>
                      <Text>
                        {t(`Join the official Idena public Telegram group and follow instructions in the
                pinned message.`)}
                      </Text>
                    </Stack>
                    <OnboardingPopoverContentIconRow icon="telegram">
                      <Box>
                        <PrimaryButton
                          variant="unstyled"
                          p={0}
                          onClick={() => {
                            global.openExternal(
                              'https://t.me/IdenaNetworkPublic'
                            )
                          }}
                        >
                          https://t.me/IdenaNetworkPublic
                        </PrimaryButton>
                        <Text fontSize="sm" color="rgba(255, 255, 255, 0.56)">
                          {t('Official group')}
                        </Text>
                      </Box>
                    </OnboardingPopoverContentIconRow>
                  </Stack>
                </OnboardingPopoverContent>
              </OnboardingPopover>

              <TaskConfetti
                active={eitherState(
                  currentOnboarding,
                  `${doneOnboardingStep(OnboardingStep.ActivateInvite)}.salut`
                )}
              />
            </Stack>
            <Stack spacing={6} w={rem(200)}>
              <Flex h={24}>
                {canMine && (
                  <Stack spacing={2} justify="center" flex={1}>
                    <Text fontWeight={500}>{t('Status')}</Text>
                    <MinerStatusSwitcher />
                  </Stack>
                )}
              </Flex>
              <Stack spacing={1} align="flex-start">
                <IconLink
                  href="/oracles/new"
                  icon={<Icon name="oracle" size={5} />}
                >
                  {t('New voting')}
                </IconLink>
                <IconLink
                  href="/flips/new"
                  icon={<Icon name="photo" size={5} />}
                >
                  {t('New flip')}
                </IconLink>
                <IconLink
                  href="/contacts/new-invite"
                  isDisabled={invitesCount === 0}
                  icon={<Icon name="add-user" size={5} />}
                >
                  {t('Invite')}
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
            </Stack>
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
