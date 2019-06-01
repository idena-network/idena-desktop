import React, {useContext} from 'react'
import {withRouter} from 'next/router'
import {Box, List, Link, Text} from '../shared/components'
import userScheme from '../shared/types/user'
import theme from '../shared/theme'
import NetContext from '../shared/providers/net-provider'
import Loading from '../shared/components/loading'
import {If} from '../shared/components/utils'
import {ValidationContext} from '../shared/providers/validation-provider'
import {isValidationRunning} from '../shared/utils/validation'

const NavItem = withRouter(({href, router, children}) => {
  const active = router.pathname.startsWith(href)
  return (
    <li>
      <Link
        href={href}
        color={active ? theme.colors.white : theme.colors.white05}
      >
        {children}
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

// eslint-disable-next-line react/prop-types
const Block = ({title, value}) => (
  <Box
    bg=""
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
      {value}
    </Text>
  </Box>
)

function Nav({user}) {
  const {currentPeriod, nextValidation, requiredFlips, madeFlips} = useContext(
    NetContext
  )

  return (
    <nav>
      <Box m="2em 0">
        <img src="../static/logo.svg" alt="idena logo" />
      </Box>
      <List>
        <NavItem href="/dashboard" active>
          {'My Idena' || user.name}
        </NavItem>
        <NavItem href="/flips">Flips</NavItem>
        <NavItem href="/contacts">Contacts</NavItem>
        <NavItem href="/settings">Settings</NavItem>
        <Box
          bg={theme.colors.white01}
          m={`${theme.spacings.xlarge} 0`}
          css={{borderRadius: '10px'}}
        >
          <Block title="Current period" value={currentPeriod || <Loading />} />
          {!isValidationRunning(currentPeriod) && (
            <Block
              title="My current task"
              value={
                Number.isFinite(requiredFlips) &&
                `Create ${requiredFlips - madeFlips} flips`
              }
            />
          )}
          {!isValidationRunning(currentPeriod) && (
            <Block
              title="Next validation"
              value={
                nextValidation ? (
                  new Date(nextValidation).toLocaleString()
                ) : (
                  <Loading />
                )
              }
            />
          )}
        </Box>
      </List>
      <style jsx>{`
        nav {
          background: ${theme.colors.primary2};
          color: white;
          padding: 2em;
          width: 250px;
          text-align: center;
          min-height: 100vh;
        }
        img {
          width: 96px;
          filter: invert(1);
        }
      `}</style>
    </nav>
  )
}

Nav.propTypes = {
  user: userScheme,
}

export default React.memo(Nav)
