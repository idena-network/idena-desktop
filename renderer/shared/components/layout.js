import React from 'react'
import {withRouter} from 'next/router'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'

// eslint-disable-next-line react/prop-types
function Layout({router, children}) {
  return (
    <main>
      <Sidebar />
      <section>
        {!router.pathname.startsWith('/validation') && <ValidationBanner />}
        {children}
      </section>
      <Notifications />
      <style jsx>{`
        main {
          display: flex;
          padding: 0;
          margin: 0;
          max-height: 100vh;
          overflow: hidden;
        }
        section {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </main>
  )
}

export default withRouter(Layout)
