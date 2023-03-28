/* eslint-disable react/prop-types */
import React, {useState} from 'react'
import NextLink from 'next/link'
import {useRouter} from 'next/router'
import {Trans, useTranslation} from 'react-i18next'
import {
  Box,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  PopoverTrigger,
  Stack,
  Text,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Link,
  LinkOverlay,
  LinkBox,
  Image,
  Icon,
  Portal,
} from '@chakra-ui/react'
import {useIdentityState} from '../providers/identity-context'
import {useEpochState} from '../providers/epoch-context'
import {useChainState} from '../providers/chain-context'
import {useAutoUpdate} from '../providers/update-context'
import useRpc from '../hooks/use-rpc'
import {usePoll} from '../hooks/use-interval'
import {loadValidationState} from '../../screens/validation/utils'
import {IdentityStatus, EpochPeriod, OnboardingStep} from '../types'
import {useVotingNotification} from '../providers/voting-notification-context'
import {useOnboarding} from '../providers/onboarding-context'
import {
  onboardingPromotingStep,
  onboardingShowingStep,
} from '../utils/onboarding'
import {
  OnboardingLinkButton,
  OnboardingPopover,
  OnboardingPopoverContent,
  OnboardingPopoverContentIconRow,
} from './onboarding'
import {
  buildNextValidationCalendarLink,
  eitherState,
  formatValidationDate,
} from '../utils/utils'
import {ExternalLink, Tooltip} from './components'
import {useTimingState} from '../providers/timing-context'
import {TodoVotingCountBadge} from '../../screens/oracles/components'
import {
  AdsIcon,
  ClockIcon,
  ContactsIcon,
  GalleryIcon,
  MoreIcon,
  OracleIcon,
  PlusSolidIcon,
  ProfileIcon,
  SettingsIcon,
  SyncIcon,
  TelegramIcon,
  TimerIcon,
  WalletIcon,
} from './icons'

export default function Sidebar({
  isForkAvailable,
  didActivateFork,
  didRejectFork,
  onResetForkVoting,
}) {
  return (
    <Flex
      as="section"
      direction="column"
      justify="space-between"
      bg="brandGray.500"
      color="white"
      px={4}
      py={2}
      h="100vh"
      w={200}
      minW={200}
      zIndex={2}
      position="relative"
      overflow="hidden"
    >
      <Flex direction="column" align="flex-start">
        <Status />
        <Logo />
        <Navbar />
        <ActionPanel />
      </Flex>
      <Box>
        <Version
          isForkAvailable={isForkAvailable}
          didActivateFork={didActivateFork}
          didRejectFork={didRejectFork}
          onResetForkVoting={onResetForkVoting}
        />
      </Box>
    </Flex>
  )
}

export function Status() {
  const {t} = useTranslation()

  const {loading, syncing, offline} = useChainState()

  const {wrongClientTime} = useTimingState()

  switch (true) {
    case loading:
      return (
        <StatusContent bg="xwhite.010">
          <StatusText color="muted">{t('Getting node status...')}</StatusText>
        </StatusContent>
      )

    case offline:
      return (
        <StatusContent bg="red.020">
          <Tooltip
            label={t('Your node is either offline or unreachable')}
            zIndex="tooltip"
          >
            <StatusText color="red.500">{t('Offline')}</StatusText>
          </Tooltip>
        </StatusContent>
      )

    case syncing:
      return (
        <StatusContent bg="orange.020">
          <ConnectionBandwidth />
        </StatusContent>
      )

    case wrongClientTime:
      return (
        <StatusContent bg="red.020">
          <Popover trigger="hover" usePortal>
            <PopoverTrigger>
              <Stack isInline align="center" spacing={1} color="red.500">
                <ClockIcon boxSize="5" />
                <Text fontWeight={500}>{t('Wrong time')}</Text>
              </Stack>
            </PopoverTrigger>
            <PopoverContent
              gutter={10}
              bg="graphite.500"
              border="none"
              boxShadow="none"
              w={205}
              zIndex="popover"
            >
              <PopoverArrow border="none" boxShadow="none" />
              <PopoverBody fontSize="sm" p={2} pb={3}>
                <Stack spacing={1}>
                  <Text color="muted">
                    {t(
                      'The time must be synchronized with internet time for the successful validation'
                    )}
                  </Text>
                  <ExternalLink
                    color="white"
                    fontSize="sm"
                    href="https://time.is"
                  >
                    {t('Check immediately')}
                  </ExternalLink>
                </Stack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </StatusContent>
      )

    default:
      return (
        <StatusContent bg="green.020">
          <ConnectionBandwidth />
        </StatusContent>
      )
  }
}

function StatusContent(props) {
  return (
    <Flex align="center" borderRadius="xl" h={6} pl={2} pr={3} {...props} />
  )
}

// eslint-disable-next-line react/display-name
const StatusText = React.forwardRef((props, ref) => (
  <Text ref={ref} fontWeight={500} {...props} />
))

function ConnectionBandwidth() {
  const {t} = useTranslation()

  const {syncing, currentBlock, highestBlock} = useChainState()

  const [{result: peers}] = usePoll(useRpc('net_peers'), 5000)

  const peersCount = (peers || []).length

  return (
    <Tooltip
      label={
        <>
          <Text>
            {t('Peers: {{peersCount}}', {
              peersCount,
              nsSeparator: '!!',
            })}
          </Text>
          <Text>
            {syncing
              ? t('Blocks: {{currentBlock}} out of {{highestBlock}}', {
                  currentBlock,
                  highestBlock,
                  nsSeparator: '!!',
                })
              : t('Current block: {{currentBlock}}', {
                  currentBlock,
                  nsSeparator: '!!',
                })}
          </Text>
        </>
      }
      zIndex="tooltip"
    >
      <Stack isInline spacing={1}>
        <Bandwidth peersCount={(peers || []).length} isSyncing={syncing} />
        {syncing ? (
          <StatusText color="orange.500">{t('Synchronizing')}</StatusText>
        ) : (
          <StatusText color="green.500">{t('Synchronized')}</StatusText>
        )}
      </Stack>
    </Tooltip>
  )
}

function Bandwidth({peersCount, isSyncing, ...props}) {
  return (
    <Box pt="0.5" px="px" pb="3px" h="4" w="4" {...props}>
      <Stack
        isInline
        spacing="0.5"
        justify="space-between"
        alignItems="flex-end"
      >
        {Array.from({length: 4}).map((_, idx) => (
          <BandwidthItem
            key={idx}
            bg={`${isSyncing ? 'orange' : 'green'}.${
              idx < peersCount ? '500' : '040'
            }`}
            height={`${(idx + 1) * 3}px`}
          />
        ))}
      </Stack>
    </Box>
  )
}

function BandwidthItem(props) {
  return (
    <Box
      borderRadius="1px"
      w="0.5"
      transition="background 0.3s ease"
      {...props}
    />
  )
}

export function Logo() {
  return (
    <Image src="/static/logo.svg" alt="Idena logo" w="14" my="8" mx="auto" />
  )
}

function Navbar() {
  const {t} = useTranslation()

  const [{todoCount}] = useVotingNotification()

  return (
    <Nav>
      <NavItem href="/home" icon={ProfileIcon}>
        {t('My Idena')}
      </NavItem>
      <NavItem href="/wallets" icon={WalletIcon}>
        {t('Wallets')}
      </NavItem>
      <NavItem href="/flips/list" icon={GalleryIcon}>
        {t('Flips')}
      </NavItem>
      <NavItem href="/contacts" icon={ContactsIcon}>
        {t('Contacts')}
      </NavItem>
      <NavItem href="/oracles/list" icon={OracleIcon} display>
        {todoCount > 0 ? (
          <Flex flex={1} align="center" justify="space-between">
            <Text as="span">{t('Oracle voting')}</Text>
            <TodoVotingCountBadge>
              {todoCount > 10 ? '10+' : todoCount}
            </TodoVotingCountBadge>
          </Flex>
        ) : (
          t('Oracle voting')
        )}
      </NavItem>
      <NavItem href="/adn/list" icon={AdsIcon}>
        {t('Ads')}
      </NavItem>
      <NavItem href="/settings/general" icon={SettingsIcon}>
        {t('Settings')}
      </NavItem>
    </Nav>
  )
}

function Nav(props) {
  return <Flex direction="column" w="full" {...props} />
}

function NavItem({href, icon, children}) {
  const {pathname} = useRouter()
  const isActive = pathname.startsWith(href)

  return (
    <LinkBox
      as={Stack}
      direction="row"
      spacing="2"
      alignItems="center"
      bg={isActive ? 'xblack.016' : 'transparent'}
      borderRadius="md"
      color={isActive ? 'white' : 'xwhite.050'}
      fontWeight={500}
      minH={8}
      px={2}
      _hover={{bg: isActive ? 'xblack.016' : 'gray.10', color: 'white'}}
      _active={{
        bg: 'xblack.016',
      }}
      _focus={{outline: 'none'}}
    >
      <Icon as={icon} boxSize="5" />
      <NextLink href={href} passHref>
        <LinkOverlay display="block" w="full">
          {children}
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  )
}

function ActionPanel() {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const router = useRouter()

  const {syncing} = useChainState()
  const identity = useIdentityState()
  const epoch = useEpochState()

  const [currentOnboarding, {showCurrentTask, dismissCurrentTask}] =
    useOnboarding()

  if (syncing || !epoch) {
    return null
  }

  const {currentPeriod, nextValidation} = epoch

  const eitherOnboardingState = (...states) =>
    eitherState(currentOnboarding, ...states)

  const isPromotingNextOnboardingStep =
    currentPeriod === EpochPeriod.None &&
    (eitherOnboardingState(
      onboardingPromotingStep(OnboardingStep.ActivateInvite),
      onboardingPromotingStep(OnboardingStep.ActivateMining)
    ) ||
      (eitherOnboardingState(
        onboardingPromotingStep(OnboardingStep.Validate)
      ) &&
        [IdentityStatus.Candidate, IdentityStatus.Newbie].includes(
          identity.state
        )) ||
      (eitherOnboardingState(
        onboardingPromotingStep(OnboardingStep.CreateFlips)
      ) &&
        [IdentityStatus.Newbie].includes(identity.state)))

  return (
    <Box w="full" position="relative">
      <Stack spacing="1px" borderRadius="md" overflow="hidden" mt={6}>
        {currentPeriod !== EpochPeriod.None && (
          <ActionItem title={t('Current period')}>{currentPeriod}</ActionItem>
        )}

        <Box
          cursor={isPromotingNextOnboardingStep ? 'pointer' : 'default'}
          onClick={() => {
            if (
              eitherOnboardingState(
                OnboardingStep.ActivateInvite,
                OnboardingStep.ActivateMining
              )
            )
              router.push('/home')
            if (eitherOnboardingState(OnboardingStep.CreateFlips))
              router.push('/flips/list')

            showCurrentTask()
          }}
        >
          <PulseFrame isActive={isPromotingNextOnboardingStep}>
            <ActionItem title={t('My current task')}>
              <CurrentTask
                epoch={epoch.epoch}
                period={currentPeriod}
                identity={identity}
              />
            </ActionItem>
          </PulseFrame>
        </Box>

        {currentPeriod === EpochPeriod.None && (
          <OnboardingPopover
            isOpen={eitherOnboardingState(
              onboardingShowingStep(OnboardingStep.Validate)
            )}
            placement="right"
          >
            <PopoverTrigger>
              <Box
                bg={
                  eitherOnboardingState(
                    onboardingShowingStep(OnboardingStep.Validate)
                  )
                    ? 'rgba(216, 216, 216, .1)'
                    : 'transparent'
                }
                position="relative"
                zIndex={9}
              >
                <ActionItem title={t('Next validation')}>
                  {formatValidationDate(nextValidation, language)}
                </ActionItem>
              </Box>
            </PopoverTrigger>
            <Portal>
              <OnboardingPopoverContent
                title={t('Schedule your next validation')}
                maxW="sm"
                additionFooterActions={
                  <Button
                    variant="unstyled"
                    onClick={() => {
                      global.openExternal(
                        'https://medium.com/idena/how-do-i-start-using-idena-c49418e01a06'
                      )
                    }}
                  >
                    {t('Read more')}
                  </Button>
                }
                onDismiss={dismissCurrentTask}
              >
                <Stack spacing={5}>
                  <OnboardingPopoverContentIconRow icon={TelegramIcon}>
                    <Trans i18nKey="onboardingValidateSubscribe" t={t}>
                      <OnboardingLinkButton href="https://t.me/IdenaAnnouncements">
                        Subscribe
                      </OnboardingLinkButton>{' '}
                      to the Idena Announcements (important updates only)
                    </Trans>
                  </OnboardingPopoverContentIconRow>
                  <OnboardingPopoverContentIconRow icon={SyncIcon}>
                    {t(
                      `Keep your node synchronized in 45-60 minutes before the validation starts.`
                    )}
                  </OnboardingPopoverContentIconRow>
                  <OnboardingPopoverContentIconRow icon={TimerIcon}>
                    {t(
                      `Solve the flips quickly when validation starts. The first 6 flips must be submitted in less than 2 minutes.`
                    )}
                  </OnboardingPopoverContentIconRow>
                  <OnboardingPopoverContentIconRow icon={GalleryIcon}>
                    <Trans i18nKey="onboardingValidateTest" t={t}>
                      <OnboardingLinkButton href="https://flips.idena.io/?pass=idena.io">
                        Test yourself
                      </OnboardingLinkButton>{' '}
                      before the validation
                    </Trans>
                  </OnboardingPopoverContentIconRow>
                </Stack>
              </OnboardingPopoverContent>
            </Portal>
          </OnboardingPopover>
        )}
      </Stack>

      {currentPeriod === EpochPeriod.None && (
        <Menu autoSelect={false} placement="bottom-end">
          <MenuButton
            rounded="md"
            py="1.5"
            px="0.5"
            position="absolute"
            bottom="6"
            right="1"
            zIndex="popover"
            _hover={{bg: 'unset'}}
            _expanded={{bg: 'gray.500'}}
            _focus={{outline: 0}}
          >
            <MoreIcon boxSize="5" />
          </MenuButton>
          <MenuList
            border="none"
            shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
            rounded="lg"
            py={2}
            minWidth="145px"
            zIndex="popover"
          >
            <MenuItem
              color="gray.500"
              fontWeight={500}
              px="3"
              py="2"
              _hover={{bg: 'gray.50'}}
              _focus={{bg: 'gray.50'}}
              _selected={{bg: 'gray.50'}}
              _active={{bg: 'gray.50'}}
              onClick={() => {
                global.openExternal(
                  buildNextValidationCalendarLink(nextValidation)
                )
              }}
            >
              <PlusSolidIcon boxSize="5" mr="3" color="blue.500" />
              {t('Add to calendar')}
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </Box>
  )
}

function PulseFrame({isActive, children, ...props}) {
  return (
    <Box roundedTop="md" {...props}>
      {isActive ? (
        <Box
          roundedTop="md"
          shadow="inset 0 0 0 2px #578fff"
          animation="pulseFrame 1.2s infinite"
        >
          {children}
          {/* eslint-disable-next-line react/no-unknown-property */}
          <style jsx global>{`
            @keyframes pulseFrame {
              0% {
                box-shadow: inset 0 0 0 2px rgba(87, 143, 255, 0),
                  inset 0 0 0 6px rgba(87, 143, 255, 0);
              }

              40% {
                box-shadow: inset 0 0 0 2px rgba(87, 143, 255, 1),
                  inset 0 0 0 6px rgba(87, 143, 255, 0.3);
              }

              50% {
                box-shadow: inset 0 0 0 2px rgba(87, 143, 255, 1),
                  inset 0 0 0 6px rgba(87, 143, 255, 0.3);
              }

              100% {
                box-shadow: inset 0 0 0 2px rgba(87, 143, 255, 0),
                  inset 0 0 0 6px rgba(87, 143, 255, 0);
              }
            }
          `}</style>
        </Box>
      ) : (
        children
      )}
    </Box>
  )
}

function ActionItem({title, children, value = children, ...props}) {
  return (
    <Box bg="gray.10" fontWeight={500} p={3} pt={2} {...props}>
      <Text color="xwhite.050">{title}</Text>
      <Box color="white">{value}</Box>
    </Box>
  )
}

function CurrentTask({epoch, period, identity}) {
  const {t} = useTranslation()

  const [currentOnboarding] = useOnboarding()

  if (!period || !identity.state) return null

  switch (period) {
    case EpochPeriod.None: {
      const {
        flips,
        requiredFlips: requiredFlipsNumber,
        availableFlips: availableFlipsNumber,
        state: status,
        canActivateInvite,
      } = identity

      switch (true) {
        case canActivateInvite:
          return status === IdentityStatus.Invite
            ? t('Accept invitation')
            : t('Activate invitation')

        case currentOnboarding.matches(OnboardingStep.ActivateMining): {
          return t('Activate mining status')
        }

        case [
          IdentityStatus.Human,
          IdentityStatus.Verified,
          IdentityStatus.Newbie,
        ].includes(status): {
          const publishedFlipsNumber = (flips || []).length
          const remainingRequiredFlipsNumber =
            requiredFlipsNumber - publishedFlipsNumber
          const optionalFlipsNumber =
            availableFlipsNumber -
            Math.max(requiredFlipsNumber, publishedFlipsNumber)

          const shouldSendFlips = remainingRequiredFlipsNumber > 0

          // eslint-disable-next-line no-nested-ternary
          return shouldSendFlips ? (
            <CurrentTaskLink href="/flips/list">
              {t('Create {{count}} required flips', {
                count: remainingRequiredFlipsNumber,
              })}
            </CurrentTaskLink>
          ) : optionalFlipsNumber > 0 ? (
            t('Wait for validation or create {{count}} optional flips', {
              count: optionalFlipsNumber,
            })
          ) : (
            t('Wait for validation')
          )
        }

        case [
          IdentityStatus.Candidate,
          IdentityStatus.Suspended,
          IdentityStatus.Zombie,
        ].includes(status):
          return t('Wait for validation')

        default:
          return '...'
      }
    }

    case EpochPeriod.ShortSession:
    case EpochPeriod.LongSession: {
      const validationState = loadValidationState()

      switch (true) {
        case [IdentityStatus.Undefined, IdentityStatus.Invite].includes(
          identity.state
        ):
          return t(
            'Can not start validation session because you did not activate invite'
          )

        case [
          IdentityStatus.Candidate,
          IdentityStatus.Suspended,
          IdentityStatus.Zombie,
          IdentityStatus.Newbie,
          IdentityStatus.Verified,
          IdentityStatus.Human,
        ].includes(identity.state): {
          if (validationState) {
            const {
              done,
              context: {epoch: lastValidationEpoch},
            } = validationState

            const isValidated = [
              IdentityStatus.Newbie,
              IdentityStatus.Verified,
              IdentityStatus.Human,
            ].includes(identity.state)

            if (lastValidationEpoch === epoch)
              return done ? (
                t(`Wait for validation end`)
              ) : (
                <CurrentTaskLink href="/validation">
                  {t('Validate')}
                </CurrentTaskLink>
              )

            return isValidated
              ? t(
                  'Can not start validation session because you did not submit flips.'
                )
              : 'Starting your validation session...' // this is not normal thus not localized
          }
          return '...'
        }

        default:
          return '...'
      }
    }

    case EpochPeriod.FlipLottery:
      return t('Shuffling flips...')

    case EpochPeriod.AfterLongSession:
      return t(`Wait for validation end`)

    default:
      return '...'
  }
}

function CurrentTaskLink({href, ...props}) {
  return (
    <NextLink href={href} passHref>
      <Link color="white" _hover={{textDecoration: 'none'}} {...props} />
    </NextLink>
  )
}

export function Version({
  isForkAvailable,
  didActivateFork,
  didRejectFork,
  onResetForkVoting,
}) {
  const {t} = useTranslation()

  const [
    {
      nodeCurrentVersion,
      nodeRemoteVersion,
      nodeUpdating,
      nodeProgress,
      canUpdateNode,
      canUpdateClient,
      uiRemoteVersion,
    },
    {updateClient, updateNode},
  ] = useAutoUpdate()

  const [clientUpdating, setClientUpdating] = useState(false)

  return (
    <Stack spacing="2">
      <Stack spacing="px" mx="2">
        <VersionText>
          {t('Client version: {{version}}', {
            version: global.appVersion,
            nsSeparator: '!!',
          })}
        </VersionText>
        <VersionText>
          {t('Node version: {{version}}', {
            version: nodeCurrentVersion,
            nsSeparator: '!!',
          })}
        </VersionText>
      </Stack>
      <Stack>
        {!clientUpdating && canUpdateClient && (
          <UpdateButton
            version={uiRemoteVersion}
            onClick={() => {
              setClientUpdating(!global.isMac)
              updateClient()
            }}
          >
            {t('Update Client Version')}
          </UpdateButton>
        )}

        {(nodeUpdating || clientUpdating) && (
          <Text color="xwhite.050" mx={2}>
            {t('Updating...')}
          </Text>
        )}

        {canUpdateNode &&
          (!nodeProgress || nodeProgress.percentage === 100) && (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {isForkAvailable ? (
                // eslint-disable-next-line react/jsx-no-useless-fragment
                <>
                  {didActivateFork || !didRejectFork ? null : (
                    <UpdateButton
                      version={nodeRemoteVersion}
                      onClick={onResetForkVoting}
                    >
                      {t('Update Node Version')}
                    </UpdateButton>
                  )}
                </>
              ) : (
                <UpdateButton version={nodeRemoteVersion} onClick={updateNode}>
                  {t('Update Node Version')}
                </UpdateButton>
              )}
            </>
          )}
      </Stack>
    </Stack>
  )
}

export function VersionText(props) {
  return <Text color="xwhite.050" fontWeight={500} {...props} />
}

export function UpdateButton({version, children, ...props}) {
  return (
    <Button
      bg="white"
      borderRadius="lg"
      px={4}
      py={2}
      minH={12}
      h="auto"
      whiteSpace="pre-wrap"
      _hover={{
        bg: 'xwhite.090',
      }}
      _disabled={{
        opacity: 0.5,
      }}
      {...props}
    >
      <Stack spacing="1/2">
        <Text color="brandGray.500" fontWeight={500}>
          {children}
        </Text>
        <Text color="muted" fontWeight={400}>
          {version}
        </Text>
      </Stack>
    </Button>
  )
}
