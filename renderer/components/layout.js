import React, {useContext} from 'react'
import {withRouter} from 'next/router'
import Nav from './nav'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notifications from './notifications'
import ValidationBanner from '../screens/validation/shared/components/banner'
import {ValidationProvider} from '../shared/providers/validation-context'
import {SyncProvider} from '../shared/providers/sync-context'
import SyncStatus from './sync-status'

// eslint-disable-next-line react/prop-types
function Layout({children}) {
  const {notifications} = useContext(NotificationContext)

  return (
    <main>
      <Nav />
      <section>{children}</section>
      <ValidationProvider>
        <ValidationBanner />
      </ValidationProvider>
      <Notifications notifications={notifications} />
      <SyncProvider>
        <SyncStatus />
      </SyncProvider>
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
    </main>
  )
}

export default Layout
