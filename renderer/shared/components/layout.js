import React from 'react'
import Nav from './nav'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'
import {ValidationProvider} from '../providers/validation-context'
import {SyncProvider} from '../providers/sync-context'
import SyncStatus from './sync-status'

// eslint-disable-next-line react/prop-types
function Layout({children}) {
  return (
    <main>
      <Nav />
      <section>{children}</section>
      <ValidationProvider>
        <ValidationBanner />
      </ValidationProvider>
      <Notifications />
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
