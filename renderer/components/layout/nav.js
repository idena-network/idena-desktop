import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import {withRouter} from 'next/router'
import {Box, Text} from '../../shared/components'

const NavItem = withRouter(({href, router, children}) => {
  const active = router.pathname === href
  return (
    <Link href={href}>
      <li>
        <a href={href}>{children}</a>
        <style jsx>{`
          li {
            ${active && `background: rgba(255, 255, 255, 0.1);`}
            ${active && `border-radius: 4px;`};
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            margin: 0 0 0.5em;
            padding: 0.5em 1em;
          }

          a {
            color: rgba(255, 255, 255, 0.5);
            text-decoration: none;
            ${active && 'color: rgb(255, 255, 255);'};
          }

          a:hover {
            color: rgb(255, 255, 255);
          }
        `}</style>
      </li>
    </Link>
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
    <ul>
      <NavItem href="/contact-list">Contacts</NavItem>
      <NavItem href="/chats">Chats</NavItem>
      <NavItem href="/wallets">Wallets</NavItem>
      <NavItem href="/dashboard" active>
        My Idena
      </NavItem>
      <NavItem href="/submit-flip">+ flip</NavItem>
    </ul>
    <style jsx>{`
      nav {
        background: rgb(83, 86, 92);
        color: white;
        padding: 2em;
        width: 250px;
        text-align: center;
      }

      ul {
        list-style-type: none;
        padding: 0;
        margin: 3em 0;
        text-align: left;
      }

      img {
        width: 96px;
        filter: invert(1);
      }
    `}</style>
  </nav>
)

Nav.propTypes = {
  user: PropTypes.string.isRequired,
}

export default React.memo(Nav)
