import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {FiUserCheck} from 'react-icons/fi'
import {margin, rem, borderRadius} from 'polished'
import {Box, List, Link, Text, Button} from '.'
import Flex from './flex'
import theme from '../theme'
import Loading from './loading'
import {useIdentityState, IdentityStatus} from '../providers/identity-context'
import {useEpochState, EpochPeriod} from '../providers/epoch-context'
import {useChainState} from '../providers/chain-context'
import {useValidationState} from '../providers/validation-context'
import {
  UPDATE_DOWNLOADED,
  UPDATE_APPLY,
  UPDATE_LOADING,
} from '../../../main/channels'

function Sidebar() {
  const [updateDownloded, setUpdateDownloded] = useState(false)
  const [updatePercent, setUpdatePercent] = useState(0)

  const updateAvailable = () => {
    setUpdateDownloded(true)
  }

  const updateLoading = (_, info) => {
    setUpdatePercent(info.percent)
  }

  useEffect(() => {
    global.ipcRenderer.on(UPDATE_DOWNLOADED, updateAvailable)
    return () => {
      global.ipcRenderer.removeListener(UPDATE_DOWNLOADED, updateAvailable)
    }
  }, [])

  useEffect(() => {
    global.ipcRenderer.on(UPDATE_LOADING, updateLoading)
    return () => {
      global.ipcRenderer.removeListener(UPDATE_LOADING, updateLoading)
    }
  }, [])

  return (
    <section>
      <Flex direction="column" align="flex-start">
        <NodeStatus />
        <Avatar />
        <Nav />
      </Flex>
      <div>
        <InfoPanel />
        <Version
          updateReady={updateDownloded}
          updateLoadingPercent={updatePercent}
        />
      </div>
      <style jsx>{`
        section {
          background: ${theme.colors.primary2};
          color: ${theme.colors.white};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100vh;
          padding: 0 ${rem(16)};
          width: ${rem(250)};
          position: relative;
          z-index: 2;
        }
      `}</style>
    </section>
  )
}

function NodeStatus() {
  const {syncing, offline, currentBlock, highestBlock} = useChainState()

  let bg = theme.colors.white01
  let color = theme.colors.muted
  let text = 'Getting node status...'

  if (offline) {
    bg = theme.colors.danger02
    color = theme.colors.danger
    text = 'Offline'
  } else if (syncing !== null) {
    bg = syncing ? theme.colors.warning02 : theme.colors.success02
    color = syncing ? theme.colors.warning : theme.colors.success
    text = syncing ? 'Synchronizing' : 'Synchronized'
  }

  return (
    <Box
      bg={bg}
      px={rem(theme.spacings.small12)}
      py={rem(4)}
      css={{
        borderRadius: rem(12),
        color: theme.colors.white,
        ...margin(
          rem(theme.spacings.small8),
          rem(0),
          rem(theme.spacings.medium24)
        ),
      }}
      title={
        syncing
          ? `Synchronizing blocks: ${currentBlock} out of ${highestBlock}`
          : ''
      }
    >
      <Text
        color={color}
        css={{
          lineHeight: rem(18),
        }}
      >
        {text}
      </Text>
    </Box>
  )
}

function Avatar() {
  return (
    <Box
      css={{
        alignSelf: 'center',
        ...margin(0, 0, rem(40), 0),
      }}
    >
      <img src="/static/logo.svg" alt="idena logo" />
      <style jsx>{`
        img {
          width: ${rem(80)};
          filter: invert(1);
        }
      `}</style>
    </Box>
  )
}

function Nav() {
  const {nickname} = useIdentityState()
  return (
    <nav>
      <List>
        <NavItem href="/dashboard" active icon={<FiUserCheck />}>
          {'My Idena' || nickname}
        </NavItem>
        <NavItem
          href="/wallets"
          icon={<i className="icon icon--menu_wallets" />}
        >
          Wallets
        </NavItem>
        <NavItem href="/flips" icon={<i className="icon icon--menu_gallery" />}>
          Flips
        </NavItem>
        <NavItem
          href="/contacts"
          icon={<i className="icon icon--menu_contacts" />}
        >
          Contacts
        </NavItem>
        {/* <NavItem href="/chats" icon={<FiMessageSquare />}>
          Chats
        </NavItem> */}
        <NavItem href="/settings" icon={<i className="icon icon--settings" />}>
          Settings
        </NavItem>
      </List>
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

const NavItem = withRouter(({href, router, icon, children}) => {
  const active = router.pathname.startsWith(href)
  const color = active ? theme.colors.white : theme.colors.white05
  return (
    <li>
      <Link href={href} color={color} width="100%" height="100%">
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
          ${active && `background: ${theme.colors.white01}`};
          border-radius: 4px;
          color: ${theme.colors.white05};
          cursor: pointer;
          padding: 0 1em;
          line-height: 2.2em;
          margin: 0 0 0.5em;
          transition: background 0.3s ease;
        }
        li:hover {
          border-radius: 4px;
          background: ${theme.colors.white01};
        }
      `}</style>
    </li>
  )
})

function InfoPanel() {
  const {disconnected} = useChainState()
  const identity = useIdentityState()
  const epoch = useEpochState()

  if (disconnected || !epoch) {
    return null
  }

  const {currentPeriod, nextValidation} = epoch
  return (
    <Box
      bg={theme.colors.white01}
      css={{
        ...borderRadius('top', rem(10)),
        ...borderRadius('bottom', rem(10)),
      }}
    >
      {currentPeriod !== EpochPeriod.None && (
        <Block title="Current period">{currentPeriod}</Block>
      )}
      <Block title="My current task">
        <CurrentTask period={currentPeriod} identity={identity} />
      </Block>
      {currentPeriod === EpochPeriod.None && (
        <Block title="Next validation">
          {new Date(nextValidation).toLocaleString()}
        </Block>
      )}
    </Box>
  )
}

function Block({title, children, fallback = <Loading />}) {
  return (
    <Box
      bg="none"
      p={theme.spacings.normal}
      css={{
        borderBottom: `solid 1px ${theme.colors.gray3}`,
      }}
    >
      <Text
        color={theme.colors.muted}
        css={{display: 'block', marginBottom: theme.spacings.small}}
      >
        {title}
      </Text>
      <Text
        color={theme.colors.white}
        css={{
          display: 'block',
        }}
      >
        {children || fallback}
      </Text>
    </Box>
  )
}

Block.propTypes = {
  title: PropTypes.string,
  fallback: PropTypes.node,
  children: PropTypes.node,
}

function CurrentTask({period, identity}) {
  const {
    running: validationRunning = false,
    shortAnswers,
    longAnswers,
  } = useValidationState()

  if (!period || !identity || !identity.state) {
    return null
  }

  const {requiredFlips, flips, state, canActivateInvite} = identity

  if (canActivateInvite && period === EpochPeriod.None) {
    return (
      <Link href="/dashboard" color={theme.colors.white}>
        Activate invite
      </Link>
    )
  }

  if ([IdentityStatus.Verified, IdentityStatus.Newbie].includes(state)) {
    if (period === EpochPeriod.None) {
      const numOfFlipsToSubmit = requiredFlips - (flips || []).length
      const shouldSendFlips = numOfFlipsToSubmit > 0
      return shouldSendFlips ? (
        <Link href="/flips" color={theme.colors.white}>
          Create {numOfFlipsToSubmit} flip{numOfFlipsToSubmit > 1 ? 's' : ''}
        </Link>
      ) : (
        'Wait for validation'
      )
    }
    if (validationRunning) {
      if (
        (period === EpochPeriod.ShortSession && shortAnswers.length) ||
        (period === EpochPeriod.LongSession && longAnswers.length)
      ) {
        return `Wait for ${period} end`
      }
      const href = `/validation/${
        period === EpochPeriod.ShortSession ? 'short' : 'long'
      }`
      return (
        <Link href={href} color={theme.colors.white}>
          Solve flips now!
        </Link>
      )
    }
  }

  if (
    [
      IdentityStatus.Candidate,
      IdentityStatus.Suspended,
      IdentityStatus.Zombie,
    ].includes(state)
  ) {
    if (period === EpochPeriod.None) {
      return 'Wait for validation'
    }
    if (validationRunning) {
      if (shortAnswers.length && longAnswers.length) {
        return 'Wait for validation end'
      }
      const href = `/validation/${
        period === EpochPeriod.ShortSession ? 'short' : 'long'
      }`
      return (
        <Link href={href} color={theme.colors.white}>
          Solve flips now!
        </Link>
      )
    }
  }

  if (period === EpochPeriod.FlipLottery) {
    return 'Flip lottery'
  }

  if (period === EpochPeriod.AfterLongSession) {
    return 'Wait for validation end'
  }

  return '...'
}

CurrentTask.propTypes = {
  period: PropTypes.oneOf(Object.values(EpochPeriod)),
  identity: PropTypes.shape({
    requiredFlips: PropTypes.number,
    flips: PropTypes.array,
    state: PropTypes.string,
    canActivateInvite: PropTypes.bool,
  }).isRequired,
}

function Version({updateReady, updateLoadingPercent}) {
  return (
    <Box
      css={{
        ...borderRadius('top', rem(10)),
        ...borderRadius('bottom', rem(10)),
        ...margin(rem(theme.spacings.medium16), 0, rem(theme.spacings.small8)),
      }}
    >
      <Block title="Version">
        {global.appVersion}
        {updateReady ? (
          <Button
            css={margin(0, 0, 0, rem(theme.spacings.medium16))}
            onClick={() => {
              global.ipcRenderer.send(UPDATE_APPLY)
            }}
          >
            Update
          </Button>
        ) : null}
        {updateLoadingPercent > 0 && !updateReady ? (
          <span style={{marginLeft: rem(theme.spacings.medium16)}}>
            Loading:{' '}
            {Number(updateLoadingPercent).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            %
          </span>
        ) : null}
      </Block>
    </Box>
  )
}

Version.propTypes = {
  updateReady: PropTypes.bool,
  updateLoadingPercent: PropTypes.number,
}

export default Sidebar
