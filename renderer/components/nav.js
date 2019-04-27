import React from 'react'
import {withRouter} from 'next/router'
import {Box, List, Link} from '../shared/components'
import userScheme from '../shared/types/user'
import theme from '../shared/theme'

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

function Nav({user}) {
  return (
    <nav>
      <Box m="2em 0">
        <img src="../static/logo.svg" alt="idena logo" />
      </Box>
      <List>
        <NavItem href="/dashboard" active>
          {user.name}
        </NavItem>
        <NavItem href="/flips">Flips</NavItem>
        <NavItem href="/contacts">Contacts</NavItem>
        <NavItem href="/chats">Chats</NavItem>
        <NavItem href="/wallets">Wallets</NavItem>
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
}

Nav.propTypes = {
  user: userScheme,
}

export default React.memo(Nav)
