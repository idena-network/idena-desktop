import React from 'react'
import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'
import SyncingApp, {OfflineApp} from './syncing-app'

export default function Layout({syncing, offline, ...props}) {
  return (
    <main>
      <Sidebar />
      {syncing && !offline && <SyncingApp />}
      {offline && !syncing && <OfflineApp />}
      {!offline && !syncing && <NormalApp {...props} />}
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

Layout.propTypes = {
  syncing: PropTypes.bool,
  offline: PropTypes.bool,
  children: PropTypes.node,
}

function NormalApp(props) {
  const {pathname} = useRouter()
  return (
    <section>
      {!pathname.startsWith('/validation') && <ValidationBanner />}
      <div {...props} />
      <Notifications />
      <style jsx>{`
        section {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </section>
  )
}
