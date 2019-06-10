import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import SidebarNav from './nav'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notifications from './notifications'
import ValidationBanner from '../screens/validation/shared/components/banner'

function Layout({NavMenu = SidebarNav, children}) {
  const {notifications, alerts} = useContext(NotificationContext)

  return (
    <>
      <main>
        <NavMenu />
        <div>{children}</div>
      </main>
      <ValidationBanner />
      <Notifications notifications={notifications} alerts={alerts} />
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
    </>
  )
}

Layout.propTypes = {
  NavMenu: PropTypes.node,
  children: PropTypes.node,
  router: PropTypes.shape({pathname: PropTypes.string}),
}

export default withRouter(Layout)
