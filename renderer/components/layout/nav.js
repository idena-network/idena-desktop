import React from 'react'
import Link from 'next/link'
import {Text} from '../atoms'

const NavItem = ({href, active = false, children}) => (
  <Link href={href}>
    <li>
      {children}
      <style jsx>
        {`
          li {
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 0.5em;
            padding: 0.5em 1em;

            ${active &&
              `
                background: rgba(255, 255, 255, 0.1);
                color: rgb(255, 255, 255);
                border-radius: 3pt;
              `}
          }

          li.accent {
            color: rgb(255, 255, 255);
          }
        `}
      </style>
    </li>
  </Link>
)

export const Nav = ({user}) => (
  <nav>
    <div>
      <img src="../static/logo.svg" />
    </div>
    <ul>
      <Text color="white">{user.name}</Text>
      <NavItem href="/contacts">Settings</NavItem>
    </ul>
    <ul>
      <NavItem href="/contacts">Contacts</NavItem>
      <NavItem href="/chats">Chats</NavItem>
      <NavItem href="/wallets">Wallets</NavItem>
      <NavItem href="/dashboard" active>
        My Idena
      </NavItem>
    </ul>
    <style jsx>{`
      nav {
        background: rgb(83, 86, 92);
        color: white;
        padding: 2em;
        width: 150px;
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
        -webkit-filter: invert(1);
        filter: invert(1);
      }
    `}</style>
  </nav>
)

export default Nav
