import React from 'react'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'

// eslint-disable-next-line react/prop-types
function Layout({children}) {
  return (
    <main>
      <Sidebar />
      <section>{children}</section>
      <ValidationBanner />
      <Notifications />
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
