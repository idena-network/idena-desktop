import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import Nav from './nav'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notifications from './notifications'
import ValidationBanner from '../screens/validation/shared/components/banner'

function Layout({Sidebar = Nav, children}) {
  const {notifications} = useContext(NotificationContext)
  return (
    <>
      <main>
        <Sidebar />
        <section>{children}</section>
      </main>
      <ValidationBanner />
      <Notifications notifications={notifications} />
      <style jsx>{`
        main {
          display: flex;
          height: 100%;
          padding: 0;
          margin: 0;
        }
        section {
          width: 100%;
        }
      `}</style>
    </>
  )
}

Layout.propTypes = {
  Sidebar: PropTypes.node,
  children: PropTypes.node,
}

export default Layout
