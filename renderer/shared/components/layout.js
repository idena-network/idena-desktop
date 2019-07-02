import React from 'react'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'
import {ValidationProvider} from '../providers/validation-context'
import SyncStatus from './sync-status'

// eslint-disable-next-line react/prop-types
function Layout({children}) {
  return (
    <main>
      <Sidebar />
      <section>{children}</section>
      <ValidationProvider>
        <ValidationBanner />
      </ValidationProvider>
      <Notifications />
      <SyncStatus />
      <style jsx>{`
        main {
          display: flex;
          padding: 0;
          margin: 0;
        }
        section {
          flex: 1;
        }
      `}</style>
    </main>
  )
}

export default Layout
