import React from 'react'
import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import Sidebar from './sidebar'
import Notifications from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'
import SyncingApp, {OfflineApp, LoadingApp} from './syncing-app'
import {GlobalModals} from './modal'
import {useDebounce} from '../hooks/use-debounce'

const AVAILABLE_TIMEOUT = 1000 * 5

export default function Layout({loading, syncing, offline, ...props}) {
  const debouncedSyncing = useDebounce(syncing, AVAILABLE_TIMEOUT)
  const debouncedOffline = useDebounce(offline, AVAILABLE_TIMEOUT)
  return (
    <main>
      <Sidebar />
      {loading && <LoadingApp />}
      {!loading && debouncedSyncing && !debouncedOffline && <SyncingApp />}
      {!loading && debouncedOffline && !debouncedSyncing && <OfflineApp />}
      {!loading && !debouncedOffline && !debouncedSyncing && (
        <NormalApp {...props} />
      )}
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
  loading: PropTypes.bool,
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
      <GlobalModals />
      <style jsx>{`
        section {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </section>
  )
}
