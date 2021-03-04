import React from 'react'
import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import {margin, borderRadius, darken, transparentize, padding} from 'polished'
import {Trans, useTranslation} from 'react-i18next'
import {
  Badge,
  Box as ChakraBox,
  Button,
  Icon,
  PopoverTrigger,
  Stack,
  Text as ChakraText,
} from '@chakra-ui/core'
import {Box, Link, Text} from '.'
import Flex from './flex'
import theme, {rem} from '../theme'
import {useIdentityState} from '../providers/identity-context'
import {useEpochState} from '../providers/epoch-context'
import {useChainState} from '../providers/chain-context'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import useRpc from '../hooks/use-rpc'
import {usePoll} from '../hooks/use-interval'
import {Tooltip} from './tooltip'
import {loadValidationState} from '../../screens/validation/utils'
import {IdentityStatus, EpochPeriod, OnboardingStep} from '../types'
import {Logo} from '../../screens/app/components'
import {useVotingNotification} from '../providers/voting-notification-context'
import {useOnboarding} from '../providers/onboarding-context'
import {
  activeOnboardingStep,
  activeShowingOnboardingStep,
  onboardingStep,
} from '../utils/onboarding'
import {
  OnboardingLinkButton,
  OnboardingPopover,
  OnboardingPopoverContent,
  OnboardingPopoverContentIconRow,
} from './onboarding'
import {eitherState} from '../utils/utils'

function Sidebar() {
  return (
    <section>
      <Flex direction="column" align="flex-start">
        <NodeStatus />
        <Logo />
        <Nav />
        <ActionPanel />
      </Flex>
      <div>
        <Version />
      </div>
      <style jsx>{`
        section {
          background: ${theme.colors.primary2};
          color: ${theme.colors.white};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100vh;
          overflow: hidden;
          padding: ${rem(8)} ${rem(16)};
          width: ${rem(200)};
          position: relative;
          z-index: 2;
        }
      `}</style>
    </section>
  )
}

function NodeStatus() {
  const {
    loading,
    syncing,
    offline,
    currentBlock,
    highestBlock,
  } = useChainState()

  const [{result: peers}] = usePoll(useRpc('net_peers'), 3000)

  let bg = theme.colors.white01
  let color = theme.colors.muted
  let text = 'Getting node status...'

  if (!loading) {
    if (offline) {
      bg = theme.colors.danger02
      color = theme.colors.danger
      text = 'Offline'
    } else {
      bg = syncing ? theme.colors.warning02 : theme.colors.success02
      color = syncing ? theme.colors.warning : theme.colors.success
      text = syncing ? 'Synchronizing' : 'Synchronized'
    }
  }

  return (
    <Box
      bg={bg}
      css={{
        borderRadius: rem(12),
        ...margin(0, 0, 0, rem(-8)),
        ...padding(rem(2), rem(12), rem(4), rem(8)),
      }}
    >
      <Tooltip
        content={
          <div style={{minWidth: rem(90)}}>
            {offline
              ? null
              : [
                  !offline ? `Peers: ${(peers || []).length}` : '',
                  syncing
                    ? `Blocks: ${currentBlock} out of ${highestBlock}`
                    : `Current block: ${currentBlock}`,
                ].map((t, idx) => (
                  <div
                    key={idx}
                    style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}
                  >
                    {t}
                  </div>
                ))}
          </div>
        }
        placement="bottom"
      >
        <Flex align="baseline">
          {!offline && (
            <Box css={{...margin(0, rem(4), 0, 0)}}>
              <Bandwidth strength={(peers || []).length} syncing={syncing} />
            </Box>
          )}

          <Text color={color} fontWeight={500} lineHeight={rem(18)}>
            {text}
          </Text>
        </Flex>
      </Tooltip>
    </Box>
  )
}

function Nav() {
  const {t} = useTranslation()
  const {nickname} = useIdentityState()
  const [{todoCount}] = useVotingNotification()
  return (
    <nav>
      <ul
        style={{
          listStyleType: 'none',
          ...padding(0),
          ...margin(0),
          textAlign: 'left',
        }}
      >
        <NavItem href="/profile" active icon={<Icon name="profile" size={5} />}>
          {t('My Idena') || nickname}
        </NavItem>
        <NavItem href="/wallets" icon={<Icon name="wallet" size={5} />}>
          {t('Wallets')}
        </NavItem>
        <NavItem href="/flips/list" icon={<Icon name="gallery" size={5} />}>
          {t('Flips')}
        </NavItem>
        <NavItem href="/contacts" icon={<Icon name="contacts" size={5} />}>
          {t('Contacts')}
        </NavItem>
        <NavItem href="/oracles/list" icon={<Icon name="oracle" w={5} h={5} />}>
          <Flex flex={1} align="center" justify="space-between">
            <ChakraText as="span">{t('Oracle voting')}</ChakraText>
            {todoCount > 0 ? (
              <Badge
                bg="blue.500"
                color="white"
                fontSize={8}
                fontWeight={700}
                textAlign="center"
                rounded={4}
                px={1}
                py="3px"
                lineHeight="short"
                minW={4}
              >
                {todoCount > 10 ? '10+' : todoCount}
              </Badge>
            ) : null}
          </Flex>
        </NavItem>
        <NavItem
          href="/settings/general"
          icon={<Icon name="settings" size={5} />}
        >
          {t('Settings')}
        </NavItem>
      </ul>
      <style jsx>{`
        nav {
          align-self: stretch;
        }
        .icon {
          margin-left: -4px;
          margin-top: -4px;
          margin-bottom: -3px;
          position: relative;
          top: 1px;
        }
      `}</style>
    </nav>
  )
}

// eslint-disable-next-line react/prop-types
function NavItem({href, icon, children}) {
  const router = useRouter()
  const active = router.pathname.startsWith(href)
  const bg = active ? transparentize(0.84, theme.colors.black0) : ''
  const bgHover = active
    ? transparentize(0.84, theme.colors.black0)
    : transparentize(0.9, theme.colors.white)
  const color = active ? theme.colors.white : theme.colors.white05
  return (
    <li>
      <Link
        href={href}
        color={color}
        hoverColor={theme.colors.white}
        fontWeight={500}
        width="100%"
        height="100%"
        style={{
          fontWeight: 500,
          lineHeight: rem(20),
          ...padding(rem(6), rem(8)),
        }}
      >
        <Flex align="center">
          {React.cloneElement(icon, {
            color,
            fontSize: theme.fontSizes.normal,
          })}
          <Box w="8px" />
          {children}
        </Flex>
      </Link>
      <style jsx>{`
        li {
          background: ${bg};
          border-radius: ${rem(6)};
          color: ${theme.colors.white05};
          cursor: pointer;
          transition: background 0.3s ease;
        }
        li:hover {
          border-radius: 4px;
          background: ${bgHover};
        }
      `}</style>
    </li>
  )
}

function ActionPanel() {
  const {t} = useTranslation()

  const router = useRouter()

  const {syncing} = useChainState()
  const identity = useIdentityState()
  const epoch = useEpochState()

  const [currentOnboarding, {showCurrentTask, dismiss}] = useOnboarding()

  const shouldActivateInvite = currentOnboarding.matches(
    activeOnboardingStep(OnboardingStep.ActivateInvite)
  )

  const shouldValidate = currentOnboarding.matches(
    activeOnboardingStep(OnboardingStep.Validate)
  )

  const isShowingValidateStep = currentOnboarding.matches(
    activeShowingOnboardingStep(OnboardingStep.Validate)
  )

  if (syncing || !epoch) {
    return null
  }

  const {currentPeriod, nextValidation} = epoch
  return (
    <Box
      bg={theme.colors.white01}
      css={{
        minWidth: '100%',
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        ...margin(rem(24), 0, 0),
      }}
    >
      {currentPeriod !== EpochPeriod.None && (
        <Block title={t('Current period')}>{currentPeriod}</Block>
      )}

      <ChakraBox
        roundedTop="md"
        cursor={
          eitherState(
            currentOnboarding,
            onboardingStep(OnboardingStep.ActivateInvite),
            onboardingStep(OnboardingStep.Validate)
          )
            ? 'pointer'
            : 'default'
        }
        onClick={() => {
          if (shouldActivateInvite) {
            if (!router.pathname.endsWith('/profile')) router.push('/profile')
            document
              .querySelectorAll('#__next section')[1]
              .querySelector('div')
              .scroll({
                left: 0,
                top: 9999,
                behavior: 'smooth',
              })
          }
          showCurrentTask()
        }}
      >
        <PulseFrame isActive={shouldActivateInvite || shouldValidate}>
          <Block title={t('My current task')}>
            <CurrentTask
              epoch={epoch.epoch}
              period={currentPeriod}
              identity={identity}
            />
          </Block>
        </PulseFrame>
      </ChakraBox>

      {currentPeriod === EpochPeriod.None && (
        <>
          <OnboardingPopover isOpen={isShowingValidateStep} placement="right">
            <PopoverTrigger>
              <ChakraBox
                roundedBottom="md"
                bg={
                  isShowingValidateStep
                    ? 'rgba(216, 216, 216, .1)'
                    : 'transparent'
                }
                position="relative"
                zIndex={9}
              >
                <Block title={t('Next validation')}>
                  {new Date(nextValidation).toLocaleString()}
                </Block>
              </ChakraBox>
            </PopoverTrigger>
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
              onDismiss={dismiss}
            >
              <Stack spacing={5}>
                <OnboardingPopoverContentIconRow icon="telegram">
                  <Trans i18nKey="onboardingValidateSubscribe" t={t}>
                    <OnboardingLinkButton href="https://t.me/IdenaAnnouncements">
                      Subscribe
                    </OnboardingLinkButton>{' '}
                    to the Idena Announcements (important updates only)
                  </Trans>
                </OnboardingPopoverContentIconRow>
                <OnboardingPopoverContentIconRow icon="sync">
                  {t(
                    `Keep your node synchronized in 60-30 minutes before the validation starts.`
                  )}
                </OnboardingPopoverContentIconRow>
                <OnboardingPopoverContentIconRow icon="timer">
                  {t(
                    `Solve the flips quickly when validation starts. The first 6 flips must be submitted in less than 2 minutes.`
                  )}
                </OnboardingPopoverContentIconRow>
                <OnboardingPopoverContentIconRow icon="gallery">
                  <Trans i18nKey="onboardingValidateTest" t={t}>
                    <OnboardingLinkButton href="https://flips.idena.io/?pass=idena.io">
                      Test yourself
                    </OnboardingLinkButton>{' '}
                    before the validation
                  </Trans>
                </OnboardingPopoverContentIconRow>
              </Stack>
            </OnboardingPopoverContent>
          </OnboardingPopover>
        </>
      )}
    </Box>
  )
}

function PulseFrame({isActive, children, ...props}) {
  return (
    <ChakraBox
      roundedTop="md"
      shadow={isActive ? 'inset 0 0 0 2px #578fff' : 'none'}
      {...props}
    >
      {isActive ? (
        <ChakraBox
          rounded="md"
          shadow="inset 0 0 0 2px #578fff3d"
          animation="pulseFrame 1.2s infinite"
        >
          {children}
          <style jsx global>{`
            @keyframes pulseFrame {
              0% {
                box-shadow: inset 0 0 0 2px #578fff3d;
              }
              60% {
                box-shadow: inset 0 0 0 5px #578fff3d;
              }
              100% {
                box-shadow: inset 0 0 0 5px #578fff00;
              }
            }
          `}</style>
        </ChakraBox>
      ) : (
        children
      )}
    </ChakraBox>
  )
}

PulseFrame.propTypes = {
  isActive: PropTypes.bool,
  children: PropTypes.node,
}

function Block({title, children}) {
  return (
    <Box
      css={{
        borderBottom: `solid 1px ${theme.colors.gray3}`,
        ...margin(0, 0, rem(1)),
        ...padding(rem(8), rem(12)),
      }}
    >
      <Text
        color={theme.colors.white05}
        fontWeight={500}
        css={{lineHeight: rem(19)}}
      >
        {title}
      </Text>
      <Text
        color={theme.colors.white}
        fontWeight={500}
        css={{display: 'block', lineHeight: rem(20)}}
      >
        {children}
      </Text>
    </Box>
  )
}

Block.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
}

function CurrentTask({epoch, period, identity}) {
  const {t} = useTranslation()

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
          return (
            <Link href="/profile" color={theme.colors.white}>
              {t('Activate invite')}
            </Link>
          )

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
            <Link href="/flips/list" color={theme.colors.white}>
              {t('Create {{count}} required flips', {
                count: remainingRequiredFlipsNumber,
              })}
            </Link>
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
                <Link href="/validation" color={theme.colors.white}>
                  {t('Validate')}
                </Link>
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

function UpdateButton({text, version, ...props}) {
  return (
    <>
      <button type="button" {...props}>
        <span>{text}</span>
        <br />
        {version}
      </button>
      <style jsx>{`
        button {
          background: ${theme.colors.white};
          border: none;
          border-radius: 6px;
          color: ${theme.colors.muted};
          cursor: pointer;
          padding: ${`0.5em 1em`};
          outline: none;
          transition: background 0.3s ease, color 0.3s ease;
          width: 100%;
          margin-bottom: ${theme.spacings.medium16};
        }
        button span {
          color: ${theme.colors.text};
        }
        button:hover {
          background: ${darken(0.1, theme.colors.white)};
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  )
}

UpdateButton.propTypes = {
  text: PropTypes.string,
  version: PropTypes.string,
}

export function Version() {
  const autoUpdate = useAutoUpdateState()
  const {updateClient, updateNode} = useAutoUpdateDispatch()

  return (
    <>
      <Box
        css={{
          ...margin(rem(theme.spacings.small8)),
        }}
      >
        <Flex direction="column">
          <Text
            color={theme.colors.white05}
            fontWeight={500}
            css={{lineHeight: rem(20)}}
          >
            Client version: {global.appVersion}
          </Text>
          <Text
            color={theme.colors.white05}
            fontWeight={500}
            css={{lineHeight: rem(20)}}
          >
            Node version: {autoUpdate.nodeCurrentVersion}
          </Text>
        </Flex>
      </Box>
      <Box
        css={{
          ...margin(0, 0, rem(theme.spacings.small8)),
        }}
      >
        {autoUpdate.nodeUpdating && (
          <Text
            color={theme.colors.white05}
            css={{...margin(0, rem(theme.spacings.small8), 0)}}
          >
            Updating Node...
          </Text>
        )}
        {autoUpdate.canUpdateClient ? (
          <UpdateButton
            text="Update Client Version"
            version={autoUpdate.uiRemoteVersion}
            onClick={updateClient}
          />
        ) : null}
        {!autoUpdate.canUpdateClient &&
        autoUpdate.canUpdateNode &&
        (!autoUpdate.nodeProgress ||
          autoUpdate.nodeProgress.percentage === 100) ? (
          <UpdateButton
            text="Update Node Version"
            version={autoUpdate.nodeRemoteVersion}
            onClick={updateNode}
          />
        ) : null}
      </Box>
    </>
  )
}

// eslint-disable-next-line react/prop-types
function Bandwidth({strength, syncing}) {
  return (
    <div>
      <div>
        {Array.from({length: 4}).map((_, idx) => (
          <BandwidthItem
            key={`bw-${idx}`}
            active={idx < strength}
            variant={syncing ? 'warning' : 'success'}
            height={(idx + 1) * 3}
          />
        ))}
      </div>
      <style jsx>{`
        div {
          display: inline-block;
          padding: ${rem(2, theme.fontSizes.base)}
            ${rem(1, theme.fontSizes.base)} ${rem(3, theme.fontSizes.base)};
          height: ${rem(16, theme.fontSizes.base)};
          width: ${rem(16, theme.fontSizes.base)};
        }
        div > div {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
      `}</style>
    </div>
  )
}

// eslint-disable-next-line react/prop-types
function BandwidthItem({active, variant, height}) {
  return (
    <div>
      <style jsx>{`
        background-color: ${theme.colors[`${variant}${active ? '' : '04'}`]};
        border-radius: ${rem(1, theme.fontSizes.base)};
        height: ${rem(height, theme.fontSizes.base)};
        width: ${rem(2, theme.fontSizes.base)};
        transition: background 0.3s ease;
      `}</style>
    </div>
  )
}

export default Sidebar
