import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {
  FiInstagram,
  FiUsers,
  FiSettings,
  FiMessageSquare,
  FiUserCheck,
} from 'react-icons/fi'
import {margin, rem} from 'polished'
import {Box, List, Link, Text} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import Loading from '../shared/components/loading'
import useValidation from '../shared/utils/useValidation'
import useIdentity from '../shared/utils/useIdentity'
import useEpoch from '../shared/utils/useEpoch'
import useCoinbaseAddress from '../shared/utils/useCoinbaseAddress'

const NavItem = withRouter(({href, router, icon, children}) => {
  const active = router.pathname.startsWith(href)
  const color = active ? theme.colors.white : theme.colors.white05
  return (
    <li>
      <Link href={href} color={color} width="100%" height="100%">
        <Flex align="center">
          {React.cloneElement(icon, {color, fontSize: theme.fontSizes.normal})}
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
        }
        li:hover {
          border-radius: 4px;
          background: ${theme.colors.white01};
        }
      `}</style>
    </li>
  )
})

function Block({title, value, fallback = <Loading />}) {
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
        {value || fallback}
      </Text>
    </Box>
  )
}

Block.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  fallback: PropTypes.node,
}

function Nav() {
  const address = useCoinbaseAddress()
  const {nickname, requiredFlips, flips} = useIdentity(address)
  const {currentPeriod, nextValidation} = useEpoch()
  const {running: validationRunning} = useValidation()

  return (
    <nav>
      <Box css={margin(rem(32), 0, rem(40), 0)}>
        <img src="../static/logo.svg" alt="idena logo" />
      </Box>
      <List>
        <NavItem href="/dashboard" active icon={<FiUserCheck />}>
          {'My Idena' || nickname}
        </NavItem>
        <NavItem href="/flips" icon={<FiInstagram />}>
          Flips
        </NavItem>
        {/* <NavItem href="/contacts" icon={<FiUsers />}>
          Contacts
        </NavItem> 
        <NavItem href="/chats" icon={<FiMessageSquare />}>
          Chats
        </NavItem> */}
        <NavItem href="/settings" icon={<FiSettings />}>
          Settings
        </NavItem>
        <Box
          bg={theme.colors.white01}
          m={`${theme.spacings.xlarge} 0`}
          css={{borderRadius: '10px'}}
        >
          <Block title="Current period" value={currentPeriod} />
          {!validationRunning && (
            <Block
              title="My current task"
              value={
                Number.isFinite(requiredFlips) && requiredFlips ? (
                  `Create ${requiredFlips - (flips || []).length} flips`
                ) : (
                  <Link href="/dashboard" color={theme.colors.white}>
                    Activate invite
                  </Link>
                )
              }
            />
          )}
          {!validationRunning && (
            <Block
              title="Next validation"
              value={
                nextValidation
                  ? new Date(nextValidation).toLocaleString()
                  : nextValidation
              }
            />
          )}
        </Box>
      </List>
      <style jsx>{`
        nav {
          background: ${theme.colors.primary2};
          color: ${theme.colors.white};
          text-align: center;
          min-height: 100vh;
        }
        nav :global(ul) {
          padding: 0 ${rem(16)};
          width: 200px;
        }
        img {
          width: 80px;
          filter: invert(1);
        }
      `}</style>
    </nav>
  )
}

export default Nav
