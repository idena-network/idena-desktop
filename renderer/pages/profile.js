import React from 'react'
import {
  Stack,
  Text,
  useDisclosure,
  PopoverTrigger,
  Box,
  Heading,
  Button,
  HStack,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {
  UserInlineCard,
  UserStatList,
  UserStatValue,
  SpoilInviteDrawer,
  SpoilInviteForm,
  ActivateInviteForm,
  UserStat,
  UserStatLabel,
  ActivateMiningForm,
  KillIdentityDrawer,
  KillForm,
  MyIdenaBotAlert,
  StakingAlert,
  ProfileTagList,
  ReplenishStakeDrawer,
  AnnotatedUserStat,
  UserStatHelpText,
  ExportPrivateKeyDrawer,
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
  Page,
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
import {useScroll} from '../shared/hooks/use-scroll'
import {ValidationReportSummary} from '../screens/validation-report/components'
import {useIdenaBot, useStakingApy} from '../screens/profile/hooks'
import {useFailToast, useSuccessToast} from '../shared/hooks/use-toast'
import {
  AddUserIcon,
  ChevronRightIcon,
  DeleteIcon,
  OracleIcon,
  PhotoIcon,
  PooIcon,
  PrivateKeyIcon,
  TelegramIcon,
} from '../shared/components/icons'

export default function ProfilePage() {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const router = useRouter()

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

  const {syncing, offline} = useChainState()

  const identity = useIdentityState()

  const {
    address,
    state: status,
    balance,
    stake,
    replenishedStake,
    canInvite,
    canTerminate,
    canMine,
    online,
    delegatee,
    delegationEpoch,
    isValidated,
    canActivateInvite,
    pendingUndelegation,
  } = identity

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

  const toDna = toLocaleDna(language, {maximumFractionDigits: 4})

  const privateKeyDisclosure = useDisclosure()

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

  const canSubmitFlip = [
    IdentityStatus.Verified,
    IdentityStatus.Human,
    IdentityStatus.Newbie,
  ].includes(status)

  const [didConnectIdenaBot, connectIdenaBot] = useIdenaBot()

  const replenishStakeDisclosure = useDisclosure()

  const {
    onOpen: onOpenReplenishStakeDisclosure,
    onClose: onCloseReplenishStakeDisclosure,
  } = replenishStakeDisclosure

  React.useEffect(() => {
    if (Object.keys(router.query).find(q => q === 'replenishStake')) {
      onOpenReplenishStakeDisclosure()
      router.push('/profile')
    }
  }, [onOpenReplenishStakeDisclosure, router])

  const failToast = useFailToast()

  const toast = useSuccessToast()

  const stakingApy = useStakingApy()

  const lockedStake = (stake - (replenishedStake ?? 0)) * 0.75

  const freeStake =
    status === IdentityStatus.Newbie ? stake - lockedStake : stake

  const isShowingActivateMiningOnboardingStep = eitherOnboardingState(
    onboardingShowingStep(OnboardingStep.ActivateMining)
  )

  return (
    <InviteProvider>
      <Layout syncing={syncing} offline={offline}>
        {!didConnectIdenaBot && <MyIdenaBotAlert onConnect={connectIdenaBot} />}

        <Page pt="10">
          <Stack spacing="10">
            <HStack spacing="10" align="flex-end">
              <Box w="md">
                <UserInlineCard identity={identity}>
                  <ProfileTagList />
                </UserInlineCard>
              </Box>

              <Box w={200}>
                <OnboardingPopover
                  isOpen={isShowingActivateMiningOnboardingStep}
                >
                  <PopoverTrigger>
                    <Box
                      bg="white"
                      position={
                        isShowingActivateMiningOnboardingStep
                          ? 'relative'
                          : 'initial'
                      }
                      borderRadius="md"
                      p="2"
                      m="-2"
                      zIndex={2}
                    >
                      {canMine && (
                        <ActivateMiningForm
                          isOnline={online}
                          delegatee={delegatee}
                          delegationEpoch={delegationEpoch}
                          pendingUndelegation={pendingUndelegation}
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
            </HStack>

            <HStack spacing="10" align="flex-start">
              <Stack spacing="10" w="md" ref={activateInviteRef}>
                {canActivateInvite && (
                  <Box>
                    <OnboardingPopover
                      isOpen={isOpenActivateInvitePopover}
                      placement="bottom"
                    >
                      <PopoverTrigger>
                        <Stack
                          spacing="6"
                          bg="white"
                          borderRadius="lg"
                          boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
                          px="10"
                          py="8"
                          position="relative"
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
                              onHowToGetInvitation={onOpenActivateInvitePopover}
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
                        <Stack spacing="5">
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
                              <OnboardingPopoverContentIconRow
                                icon={<TelegramIcon />}
                              >
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

                <Stack spacing="8">
                  <UserStatList title={t('My Wallet')}>
                    <UserStat>
                      <UserStatLabel>{t('Address')}</UserStatLabel>
                      <UserStatValue>{address}</UserStatValue>
                      <UserStatHelpText>
                        <ExternalLink
                          href={`https://scan.idena.io/address/${address}`}
                        >
                          {t('Open in blockchain explorer')}
                        </ExternalLink>
                      </UserStatHelpText>
                    </UserStat>

                    <UserStat>
                      <UserStatLabel>{t('Balance')}</UserStatLabel>
                      <UserStatValue>{toDna(balance)}</UserStatValue>
                      <UserStatHelpText>
                        <TextLink
                          href="/wallets"
                          rightIcon={<ChevronRightIcon boxSize="2" />}
                        >
                          {t('Send')}
                        </TextLink>
                      </UserStatHelpText>
                    </UserStat>
                  </UserStatList>

                  {Boolean(status) && status !== IdentityStatus.Undefined && (
                    <Stack spacing="2">
                      <UserStatList title={t('Stake')}>
                        <Stack isInline spacing={0}>
                          <Stack spacing="3" flex={1}>
                            <UserStat>
                              <UserStatLabel
                                color="muted"
                                fontWeight={500}
                                lineHeight="base"
                              >
                                {t('Balance')}
                              </UserStatLabel>
                              <UserStatValue>
                                <Text>{toDna(freeStake)}</Text>
                              </UserStatValue>
                              <UserStatHelpText>
                                <Button
                                  variant="link"
                                  colorScheme="blue"
                                  rightIcon={<ChevronRightIcon w="2" h="2" />}
                                  iconSpacing="1"
                                  onClick={replenishStakeDisclosure.onOpen}
                                >
                                  {t('Add stake')}
                                </Button>
                              </UserStatHelpText>
                            </UserStat>
                            {stake > 0 && status === IdentityStatus.Newbie && (
                              <AnnotatedUserStat
                                annotation={t(
                                  'You need to get Verified status to get the locked funds into the normal wallet'
                                )}
                                label={t('Locked')}
                                value={toDna(lockedStake)}
                              />
                            )}
                          </Stack>
                          <Stack spacing="3" flex={1}>
                            <UserStat>
                              <UserStatLabel
                                color="muted"
                                fontWeight={500}
                                lineHeight="base"
                              >
                                {t('APY')}
                              </UserStatLabel>
                              <UserStatValue lineHeight="base">
                                <Text>
                                  {stakingApy > 0
                                    ? toPercent(stakingApy)
                                    : '--'}
                                </Text>
                                <ExternalLink
                                  href={`https://idena.io/staking?amount=${Math.floor(
                                    freeStake
                                  )}`}
                                >
                                  {t('Staking calculator')}
                                </ExternalLink>
                              </UserStatValue>
                            </UserStat>
                          </Stack>
                        </Stack>
                      </UserStatList>
                      <StakingAlert />
                    </Stack>
                  )}
                </Stack>
              </Stack>

              <Stack spacing="1" w={200}>
                <IconLink href="/oracles/new" icon={<OracleIcon />}>
                  {t('New voting')}
                </IconLink>
                <IconLink
                  href="/flips/new"
                  icon={<PhotoIcon />}
                  isDisabled={!canSubmitFlip}
                >
                  {t('New flip')}
                </IconLink>
                <IconLink
                  href="/contacts?new"
                  icon={<AddUserIcon />}
                  isDisabled={!canInvite}
                >
                  {t('Invite')}
                </IconLink>
                <IconButton2 icon={<PooIcon />} onClick={onOpenSpoilForm}>
                  {t('Spoil invite')}
                </IconButton2>
                <IconButton2
                  icon={<PrivateKeyIcon />}
                  onClick={privateKeyDisclosure.onOpen}
                >
                  {t('Backup private key')}
                </IconButton2>
                <IconButton2
                  icon={<DeleteIcon />}
                  isDisabled={!canTerminate}
                  onClick={onOpenKillForm}
                >
                  {t('Terminate')}
                </IconButton2>
              </Stack>
            </HStack>
          </Stack>

          <SpoilInviteDrawer
            isOpen={isOpenSpoilForm}
            onClose={onCloseSpoilForm}
          >
            <SpoilInviteForm
              onSpoil={async key => {
                try {
                  await callRpc('dna_activateInviteToRandAddr', {key})
                  toast(t('Invitation is successfully spoiled'))
                  onCloseSpoilForm()
                } catch {
                  failToast(t('Invitation is missing'))
                }
              }}
            />
          </SpoilInviteDrawer>

          <KillIdentityDrawer
            address={address}
            isOpen={isOpenKillForm}
            onClose={onCloseKillForm}
          >
            <KillForm onSuccess={onCloseKillForm} onFail={onCloseKillForm} />
          </KillIdentityDrawer>

          <ReplenishStakeDrawer
            {...replenishStakeDisclosure}
            onSuccess={React.useCallback(
              hash => {
                toast({
                  title: t('Transaction sent'),
                  description: hash,
                })
                onCloseReplenishStakeDisclosure()
              },
              [onCloseReplenishStakeDisclosure, t, toast]
            )}
            onError={failToast}
          />

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
                            formatValidationDate(
                              epoch.nextValidation,
                              language
                            ),
                          nsSeparator: '!!',
                        }
                      )
                    : t(
                        'Please join the next validation ceremony: {{nextValidation}}.',
                        {
                          nextValidation:
                            epoch &&
                            formatValidationDate(
                              epoch.nextValidation,
                              language
                            ),
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

          <ExportPrivateKeyDrawer {...privateKeyDisclosure} />

          {global.isDev && <FloatDebug>{currentOnboarding.value}</FloatDebug>}
        </Page>
      </Layout>
    </InviteProvider>
  )
}
