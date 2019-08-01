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
        }
        section {
          flex: 1;
        }
      `}</style>
    </main>
  )
}

export default withRouter(Layout)
