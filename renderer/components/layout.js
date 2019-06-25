import React, {useContext} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import Nav from './nav'
import {NotificationContext} from '../shared/providers/notification-provider'
import Notifications from './notifications'
import ValidationBanner from '../screens/validation/shared/components/banner'
import {ValidationProvider} from '../shared/providers/validation-context'
import {ChainProvider} from '../shared/providers/chain-context'
import SyncStatus from './sync-status'

function Layout({Sidebar = Nav, router, children}) {
  const {notifications} = useContext(NotificationContext)

  const matchValidation = router.pathname.startsWith('/validation')
  return (
    <>
      <main>
        <Sidebar />
        <section>{children}</section>
      </main>
      {!matchValidation && (
        <ValidationProvider>
          <ValidationBanner />
        </ValidationProvider>
      )}
      <Notifications notifications={notifications} />
      <ChainProvider>
        <SyncStatus />
      </ChainProvider>
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
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object,
  children: PropTypes.node,
}

export default withRouter(Layout)
