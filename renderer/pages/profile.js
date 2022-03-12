import React from 'react'
import {
  Stack,
  Text,
  Icon,
  useDisclosure,
  useToast,
  PopoverTrigger,
  Box,
  Heading,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {
  UserInlineCard,
  SimpleUserStat,
  UserStatList,
  UserStatValue,
  AnnotatedUserStat,
  SpoilInviteDrawer,
  SpoilInviteForm,
  ActivateInviteForm,
  UserStat,
  UserStatLabel,
  ActivateMiningForm,
  InviteScoreAlert,
  KillIdentityDrawer,
  MyIdenaBotAlert,
} from '../screens/profile/components'
import {
  PrimaryButton,
  IconButton2,
  SecondaryButton,
} from '../shared/components/button'
import Layout from '../shared/components/layout'
import {
  IconLink,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  ExternalLink,
  FloatDebug,
  Toast,
  Page,
  PageTitle,
  TextLink,
} from '../shared/components/components'
import {IdentityStatus, OnboardingStep} from '../shared/types'
import {
  toPercent,
  toLocaleDna,
  callRpc,
  eitherState,
  buildNextValidationCalendarLink,
  formatValidationDate,
} from '../shared/utils/utils'
import {shouldExpectValidationResults} from '../screens/validation/utils'
import {InviteProvider} from '../shared/providers/invite-context'
import {useChainState} from '../shared/providers/chain-context'
import {
  OnboardingPopover,
  OnboardingPopoverContent,
  OnboardingPopoverContentIconRow,
} from '../shared/components/onboarding'
import {useOnboarding} from '../shared/providers/onboarding-context'
import {onboardingShowingStep} from '../shared/utils/onboarding'
import {createProfileDb} from '../screens/profile/utils'
import {ExportPrivateKeyDialog} from '../screens/settings/containers'
import {useScroll} from '../shared/hooks/use-scroll'
import {ValidationReportSummary} from '../screens/validation-report/components'
import {useTotalValidationScore} from '../screens/validation-report/hooks'
import {useIdenaBot} from '../screens/profile/hooks'

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

  const {syncing, offline, highestBlock} = useChainState()

  const {
    address,
    state: status,
    balance,
    stake,
    penalty,
    age,
    totalShortFlipPoints,
    totalQualifiedFlips,
    canInvite,
    canTerminate,
    canMine,
    online,
    delegatee,
    delegationEpoch,
    isValidated,
    canActivateInvite,
  } = useIdentityState()

  const epoch = useEpochState()

  const {
    isOpen: isOpenNextValidationDialog,
    onOpen: onOpenNextValidationDialog,
    onClose: onCloseNextValidationDialog,
  } = useDisclosure()

  const profileDb = React.useMemo(() => createProfileDb(epoch), [epoch])

  const [showValidationResults, setShowValidationResults] = React.useState()

  React.useEffect(() => {
    const epochNumber = epoch?.epoch
    if (epoch && shouldExpectValidationResults(epochNumber)) {
      profileDb
        .getDidShowValidationResults()
        .then(seen => {
          setShowValidationResults(!seen)
        })
        .catch(() => {
          setShowValidationResults(true)
        })
    }
  }, [epoch, profileDb])

  React.useEffect(() => {
    if (showValidationResults === false)
      profileDb.putDidShowValidationResults(1)
  }, [profileDb, showValidationResults])

  React.useEffect(() => {
    if (epoch && isValidated) {
      profileDb
        .getDidPlanNextValidation()
        .then(didPlan => {
          if (!didPlan) onOpenNextValidationDialog()
        })
        .catch(error => {
          if (error?.notFound) onOpenNextValidationDialog()
        })
    }
  }, [epoch, isValidated, onOpenNextValidationDialog, profileDb])

  const [
    currentOnboarding,
    {dismissCurrentTask, next: nextOnboardingTask},
  ] = useOnboarding()

  const eitherOnboardingState = (...states) =>
    eitherState(currentOnboarding, ...states)

  const toDna = toLocaleDna(language)

  const {
    isOpen: isOpenExportPk,
    onOpen: onOpenExportPk,
    onClose: onCloseExportPk,
  } = useDisclosure()

  const {
    isOpen: isOpenActivateInvitePopover,
    onOpen: onOpenActivateInvitePopover,
    onClose: onCloseActivateInvitePopover,
  } = useDisclosure()

  const activateInviteRef = React.useRef()

  const {scrollTo: scrollToActivateInvite} = useScroll(activateInviteRef)

  React.useEffect(() => {
    if (
      isOpenActivateInvitePopover ||
      eitherState(
        currentOnboarding,
        onboardingShowingStep(OnboardingStep.ActivateInvite)
      )
    ) {
      scrollToActivateInvite()
      onOpenActivateInvitePopover()
    } else onCloseActivateInvitePopover()
  }, [
    currentOnboarding,
    isOpenActivateInvitePopover,
    onCloseActivateInvitePopover,
    onOpenActivateInvitePopover,
    scrollToActivateInvite,
  ])

  const totalScore = useTotalValidationScore()

  const canSubmitFlip = [
    IdentityStatus.Verified,
    IdentityStatus.Human,
    IdentityStatus.Newbie,
  ].includes(status)

  const [didConnectIdenaBot, connectIdenaBot] = useIdenaBot()

  return (
    <>
      <InviteProvider>
        <Layout syncing={syncing} offline={offline}>
          {!didConnectIdenaBot && (
            <MyIdenaBotAlert onConnect={connectIdenaBot} />
          )}

          <Page>
            <Stack spacing={8}>
              <Stack spacing={6}>
                <PageTitle mb={6}>{t('Profile')}</PageTitle>

                {canInvite && (
                  <InviteScoreAlert
                    epoch={epoch}
                    identity={{canInvite}}
                    sync={{highestBlock}}
                  />
                )}
              </Stack>
              <Stack isInline spacing={10}>
                <Stack spacing={8} w="md" ref={activateInviteRef}>
                  <UserInlineCard address={address} status={status} h={24} />

                  {canActivateInvite && (
                    <Box>
                      <OnboardingPopover
                        isOpen={isOpenActivateInvitePopover}
                        placement="bottom"
                      >
                        <PopoverTrigger>
                          <Stack
                            spacing={6}
                            bg="white"
                            borderRadius="lg"
                            boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
                            px={10}
                            py={8}
                            pos="relative"
                            zIndex="docked"
                          >
                            <Stack>
                              <Heading as="h3" fontWeight={500} fontSize="lg">
                                {status === IdentityStatus.Invite
                                  ? t('Congratulations!')
                                  : t('Join the upcoming validation')}
                              </Heading>
                              <Text color="muted">
                                {status === IdentityStatus.Invite
                                  ? t(
                                      'You have been invited to join the upcoming validation ceremony. Click the button below to accept the invitation.'
                                    )
                                  : t(
                                      'To take part in the validation, you need an invitation code. Invitations can be provided by validated identities.'
                                    )}
                              </Text>
                            </Stack>
                            <Box>
                              <ActivateInviteForm
                                onHowToGetInvitation={
                                  onOpenActivateInvitePopover
                                }
                              />
                            </Box>
                          </Stack>
                        </PopoverTrigger>
                        <OnboardingPopoverContent
                          gutter={10}
                          title={
                            status === IdentityStatus.Invite
                              ? t('Accept invitation')
                              : t('How to get an invitation code')
                          }
                          zIndex={2}
                          onDismiss={() => {
                            dismissCurrentTask()
                            onCloseActivateInvitePopover()
                          }}
                        >
                          <Stack spacing={5}>
                            {status === IdentityStatus.Invite ? (
                              <Box>
                                {t(
                                  'You are invited to join the upcoming validation. Please accept the invitation.'
                                )}
                              </Box>
                            ) : (
                              <Stack>
                                <Text>
                                  {t(`Join the official Idena public Telegram group and follow instructions in the
                pinned message.`)}
                                </Text>
                                <OnboardingPopoverContentIconRow icon="telegram">
                                  <Box>
                                    <PrimaryButton
                                      variant="unstyled"
                                      p={0}
                                      py={0}
                                      h={18}
                                      onClick={() => {
                                        global.openExternal(
                                          'https://t.me/IdenaNetworkPublic'
                                        )
                                      }}
                                    >
                                      https://t.me/IdenaNetworkPublic
                                    </PrimaryButton>
                                    <Text
                                      fontSize="sm"
                                      color="rgba(255, 255, 255, 0.56)"
                                    >
                                      {t('Official group')}
                                    </Text>
                                  </Box>
                                </OnboardingPopoverContentIconRow>
                              </Stack>
                            )}
                          </Stack>
                        </OnboardingPopoverContent>
                      </OnboardingPopover>
                    </Box>
                  )}

                  {showValidationResults && (
                    <Box>
                      <ValidationReportSummary
                        onClose={() => setShowValidationResults(false)}
                      />
                    </Box>
                  )}

                  {![
                    IdentityStatus.Undefined,
                    IdentityStatus.Invite,
                    IdentityStatus.Candidate,
                  ].includes(status) && (
                    <UserStatList title={t('Profile')}>
                      {age >= 0 && (
                        <SimpleUserStat label={t('Age')} value={age} />
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

                      {totalQualifiedFlips > 0 && (
                        <AnnotatedUserStat
                          annotation={t(
                            'Total score for the last 10 validations'
                          )}
                          label={t('Total score')}
                        >
                          <UserStatValue>
                            {t('{{point}} out of {{flipCount}} ({{score}})', {
                              point: Math.min(
                                totalShortFlipPoints,
                                totalQualifiedFlips
                              ),
                              flipCount: totalQualifiedFlips,
                              score: toPercent(totalScore),
                            })}
                          </UserStatValue>
                          <TextLink href="/validation-report" fontWeight={500}>
                            {t('View validation report')}
                          </TextLink>
                        </AnnotatedUserStat>
                      )}

                      {stake > 0 && (
                        <AnnotatedUserStat
                          annotation={t(
                            'You need to get Verified status to be able to terminate your identity and withdraw the stake'
                          )}
                          label={t('Stake')}
                          value={toDna(
                            stake *
                              (status === IdentityStatus.Newbie ? 0.25 : 1)
                          )}
                        />
                      )}

                      {stake > 0 && status === IdentityStatus.Newbie && (
                        <AnnotatedUserStat
                          annotation={t(
                            'You need to terminate your identity to withdraw the stake'
                          )}
                          label={t('Locked')}
                          value={toDna(stake * 0.75)}
                        />
                      )}
                    </UserStatList>
                  )}

                  <UserStatList title={t('Wallets')}>
                    <UserStat>
                      <UserStatLabel>{t('Address')}</UserStatLabel>
                      <UserStatValue>{address}</UserStatValue>
                      <ExternalLink
                        href={`https://scan.idena.io/address/${address}`}
                      >
                        {t('Open in blockhain explorer')}
                      </ExternalLink>
                    </UserStat>

                    <UserStat>
                      <UserStatLabel>{t('Balance')}</UserStatLabel>
                      <UserStatValue>{toDna(balance)}</UserStatValue>
                      <TextLink href="/wallets">
                        <Stack
                          isInline
                          spacing={0}
                          align="center"
                          fontWeight={500}
                        >
                          <Text as="span">{t('Send')}</Text>
                          <Icon
                            name="chevron-down"
                            size={4}
                            transform="rotate(-90deg)"
                          />
                        </Stack>
                      </TextLink>
                    </UserStat>
                  </UserStatList>
                </Stack>
                <Stack spacing={10} w={200}>
                  <Box minH={62} mt={6}>
                    <OnboardingPopover
                      isOpen={eitherOnboardingState(
                        onboardingShowingStep(OnboardingStep.ActivateMining)
                      )}
                    >
                      <PopoverTrigger>
                        <Box
                          bg="white"
                          position={
                            eitherOnboardingState(
                              onboardingShowingStep(
                                OnboardingStep.ActivateMining
                              )
                            )
                              ? 'relative'
                              : 'initial'
                          }
                          borderRadius="md"
                          p={2}
                          m={-2}
                          zIndex={2}
                        >
                          {address && canMine && (
                            <ActivateMiningForm
                              isOnline={online}
                              delegatee={delegatee}
                              delegationEpoch={delegationEpoch}
                              onShow={nextOnboardingTask}
                            />
                          )}
                        </Box>
                      </PopoverTrigger>
                      <OnboardingPopoverContent
                        title={t('Activate mining status')}
                        onDismiss={nextOnboardingTask}
                      >
                        <Text>
                          {t(
                            `To become a validator of Idena blockchain you can activate your mining status. Keep your node online to mine iDNA coins.`
                          )}
                        </Text>
                      </OnboardingPopoverContent>
                    </OnboardingPopover>
                  </Box>
                  <Stack spacing={1} align="flex-start">
                    <IconLink
                      href="/oracles/new"
                      icon={<Icon name="oracle" size={5} />}
                      maxW={200}
                    >
                      {t('New voting')}
                    </IconLink>
                    <IconLink
                      href="/flips/new"
                      icon={<Icon name="photo" size={5} />}
                      isDisabled={!canSubmitFlip}
                      maxW={200}
                    >
                      {t('New flip')}
                    </IconLink>
                    <IconLink
                      href="/contacts?new"
                      isDisabled={!canInvite}
                      maxW={200}
                      icon={<Icon name="add-user" size={5} />}
                    >
                      {t('Invite')}
                    </IconLink>
                    <IconButton2
                      icon="poo"
                      maxW={200}
                      onClick={onOpenSpoilForm}
                    >
                      {t('Spoil invite')}
                    </IconButton2>
                    <IconButton2 icon="key" maxW={200} onClick={onOpenExportPk}>
                      {t('Backup private key')}
                    </IconButton2>
                    <IconButton2
                      isDisabled={!canTerminate}
                      icon="delete"
                      maxW={200}
                      onClick={onOpenKillForm}
                    >
                      {t('Terminate')}
                    </IconButton2>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>

            <KillIdentityDrawer
              isOpen={isOpenKillForm}
              onKill={onCloseKillForm}
              onKillFailed={onCloseKillForm}
              onClose={onCloseKillForm}
            />

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
                        <Toast
                          title={t('Invitation is successfully spoiled')}
                        />
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
          </Page>
        </Layout>
      </InviteProvider>

      <Dialog
        isOpen={isOpenNextValidationDialog}
        onClose={onCloseNextValidationDialog}
      >
        <DialogHeader>
          {isValidated
            ? t('Congratulations! You have been successfully validated!')
            : t('Your status is not validated')}
        </DialogHeader>
        <DialogBody>
          <Stack spacing={1}>
            <Text>
              {isValidated
                ? t(
                    `Your status is valid till the next validation: {{nextValidation}}.`,
                    {
                      nextValidation:
                        epoch &&
                        formatValidationDate(epoch.nextValidation, language),
                      nsSeparator: '!!',
                    }
                  )
                : t(
                    'Please join the next validation ceremony: {{nextValidation}}.',
                    {
                      nextValidation:
                        epoch &&
                        formatValidationDate(epoch.nextValidation, language),
                      nsSeparator: '!!',
                    }
                  )}
            </Text>
            <Text>
              {t(
                `Add this event to your personal calendar so that you don't miss the next validation.`
              )}
            </Text>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <SecondaryButton
            onClick={() => {
              profileDb
                .putDidPlanNextValidation(1)
                .finally(onCloseNextValidationDialog)
            }}
          >
            {t('Cancel')}
          </SecondaryButton>
          <PrimaryButton
            onClick={() => {
              global.openExternal(
                buildNextValidationCalendarLink(epoch?.nextValidation)
              )
              profileDb
                .putDidPlanNextValidation(1)
                .finally(onCloseNextValidationDialog)
            }}
          >
            {t('Add to calendar')}
          </PrimaryButton>
        </DialogFooter>
      </Dialog>

      <ExportPrivateKeyDialog
        isOpen={isOpenExportPk}
        onClose={onCloseExportPk}
      />

      {global.isDev && <FloatDebug>{currentOnboarding.value}</FloatDebug>}
    </>
  )
}
