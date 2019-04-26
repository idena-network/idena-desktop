import React from 'react'
import PropTypes from 'prop-types'
import GlobalStyle from './global-style'
import SidebarNav from './nav'

function Layout({NavMenu = SidebarNav, children}) {
  return (
    <>
      <GlobalStyle />
      <main>
        <NavMenu user={{name: 'Alex'}} />
        <div>{children}</div>
        <style jsx>{`
          main {
            display: flex;
            height: 100%;
            padding: 0;
            margin: 0;
          }

          div {
            width: 100%;
          }
        `}</style>
      </main>
    </>
  )
}

Layout.propTypes = {
  NavMenu: PropTypes.node,
  children: PropTypes.node,
}

export default Layout
