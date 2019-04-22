import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import {Box, Text, List, Link} from '../../shared/components'
import theme from '../../theme'

const NavItem = withRouter(({href, router, children}) => {
  const active = router.pathname === href
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
          ${active && `border-radius: 4px;`};
          color: ${theme.colors.white05};
          cursor: pointer;
          margin: 0 0 0.5em;
          padding: 0.5em 1em;
        }
      `}</style>
    </li>
  )
})

export const Nav = ({user}) => (
  <nav>
    <div>
      <img src="../static/logo.svg" alt="idena logo" />
    </div>
    <Box m="3em 0">
      <Box m="1em 0">
        <Text color="white">{user.name}</Text>
      </Box>
    </Box>
    <List>
      <NavItem href="/contacts">Contacts</NavItem>
      <NavItem href="/chats">Chats</NavItem>
      <NavItem href="/wallets">Wallets</NavItem>
      <NavItem href="/dashboard" active>
        My Idena
      </NavItem>
      <NavItem href="/submit-flip">+ flip</NavItem>
    </List>
    <style jsx>{`
      nav {
        background: ${theme.colors.primary2};
        color: white;
        padding: 2em;
        width: 250px;
        text-align: center;
      }
      img {
        width: 96px;
        filter: invert(1);
      }
    `}</style>
  </nav>
)

Nav.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
}

export default React.memo(Nav)
