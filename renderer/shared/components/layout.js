import React from 'react'
import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {State} from 'xstate'
import Sidebar from './sidebar'
import Notifications, {Notification} from './notifications'
import ValidationBanner from '../../screens/validation/components/banner'
import SyncingApp, {OfflineApp, LoadingApp} from './syncing-app'
import {GlobalModals} from './modal'
import {useDebounce} from '../hooks/use-debounce'
import {EpochPeriod, useEpochState} from '../providers/epoch-context'
import {
  shouldStartValidation,
  loadValidationState,
} from '../../screens/validation/machine'
import {useIdentityState} from '../providers/identity-context'
import {addWheelHandler} from '../utils/mouse'
import {loadPersistentStateValue, persistItem} from '../utils/persist'
import {DnaSignInDialog, DnaSendDialog} from './dna-link'
import {
  useNotificationDispatch,
  NotificationType,
} from '../providers/notification-context'
import {validDnaUrl} from '../utils/dna-link'
import {Absolute} from './position'
import theme from '../theme'

global.getZoomLevel = global.getZoomLevel || {}

const AVAILABLE_TIMEOUT = global.isDev ? 0 : 1000 * 5

export default function Layout({loading, syncing, offline, ...props}) {
  const debouncedSyncing = useDebounce(syncing, AVAILABLE_TIMEOUT)
  const debouncedOffline = useDebounce(offline, AVAILABLE_TIMEOUT)

  const [zoomLevel, setZoomLevel] = React.useState(
    () => loadPersistentStateValue('settings', 'zoomLevel') || 0
  )
  React.useEffect(() => addWheelHandler(setZoomLevel), [])
  React.useEffect(() => {
    if (Number.isFinite(zoomLevel)) {
      global.setZoomLevel(zoomLevel)
      persistItem('settings', 'zoomLevel', zoomLevel)
    }
  }, [zoomLevel])

  const {t} = useTranslation()

  const [dnaUrl, setDnaUrl] = React.useState()

  const {addNotification, addError} = useNotificationDispatch()

  React.useEffect(() => {
    if (dnaUrl && !validDnaUrl(dnaUrl))
      addError({
        title: t('Invalid DNA link'),
        body: t(`You must provide valid URL including protocol version`),
      })
  }, [addError, dnaUrl, t])

  React.useEffect(() => {
    global.ipcRenderer.invoke('CHECK_DNA_LINK').then(setDnaUrl)
  }, [])

  React.useEffect(() => {
    const handleDnaLink = (_, e) => setDnaUrl(e)
    global.ipcRenderer.on('DNA_LINK', handleDnaLink)
    return () => {
      global.ipcRenderer.removeListener('DNA_LINK', handleDnaLink)
    }
  }, [])

  return (
    <main>
      <Sidebar />
      {loading && <LoadingApp />}
      {!loading && debouncedSyncing && !debouncedOffline && <SyncingApp />}
      {!loading && debouncedOffline && !debouncedSyncing && <OfflineApp />}
      {!loading && !debouncedOffline && !debouncedSyncing && (
        <NormalApp {...props} />
      )}
      {/* eslint-disable-next-line no-nested-ternary */}
      {validDnaUrl(dnaUrl) && (
        <>
          {new URL(dnaUrl).pathname.includes('signin') && (
            <DnaSignInDialog
              url={dnaUrl}
              onHide={() => setDnaUrl(null)}
              onSigninError={error =>
                addError({
                  title: error,
                })
              }
            />
          )}
          {new URL(dnaUrl).pathname.includes('send') && (
            <DnaSendDialog
              url={dnaUrl}
              onHide={() => setDnaUrl(null)}
              onDepositSuccess={hash =>
                addNotification({
                  title: t('Transaction sent'),
                  body: hash,
                })
              }
              onDepositError={error =>
                addError({
                  title: error,
                })
              }
            />
          )}
        </>
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
  const router = useRouter()
  const {pathname} = router

  const epoch = useEpochState()
  const identity = useIdentityState()

  React.useEffect(() => {
    if (shouldStartValidation(epoch, identity)) router.push('/validation')
  }, [epoch, identity, router])

  const [waitingForValidationEnd, setWaitingForValidationEnd] = React.useState()
  React.useEffect(() => {
    if (epoch) {
      const isValidationRunning = [
        EpochPeriod.ShortSession,
        EpochPeriod.LongSession,
      ].includes(epoch.currentPeriod)

      if (isValidationRunning) {
        const validationStateDefinition = loadValidationState()
        if (validationStateDefinition) {
          const {done} = State.create(validationStateDefinition)
          setWaitingForValidationEnd(done)
        }
      } else setWaitingForValidationEnd(false)
    }
  }, [epoch])

  const {t} = useTranslation()
  const [
    validationNotificationEpoch,
    setValidationNotificationEpoch,
  ] = React.useState(
    () => loadPersistentStateValue('validationNotification', 'epoch') || 0
  )

  React.useEffect(() => {
    if (
      !shouldShowUpcomingValidationNotification(
        epoch,
        validationNotificationEpoch
      )
    ) {
      return
    }
    showWindowNotification(
      t('Idena validation will start soon'),
      t('Keep your app opened'),
      () => {
        global.ipcRenderer.send('showMainWindow')
      }
    )
    const newEpoch = epoch.epoch + 1
    setValidationNotificationEpoch(newEpoch)
    persistItem('validationNotification', 'epoch', newEpoch)
  }, [epoch, validationNotificationEpoch, setValidationNotificationEpoch, t])

  return (
    <section style={{flex: 1, overflowY: 'auto'}}>
      {!pathname.startsWith('/validation') && <ValidationBanner />}

      <div {...props} />

      {waitingForValidationEnd && (
        <Absolute bottom={0} left={0} right={0}>
          <Notification
            bg={theme.colors.primary}
            color={theme.colors.white}
            pinned
            type={NotificationType.Info}
            title="Waiting for the end of the long session"
          />
        </Absolute>
      )}
      <Notifications />

      <GlobalModals />
    </section>
  )
}

function shouldShowUpcomingValidationNotification(
  epoch,
  upcomingValidationEpoch
) {
  if (!epoch) {
    return false
  }
  const isFlipLottery = epoch.currentPeriod === EpochPeriod.FlipLottery
  const currentEpoch = epoch.epoch
  const notificationShown = currentEpoch + 1 === upcomingValidationEpoch
  return isFlipLottery && !notificationShown
}

function showWindowNotification(title, notificationBody, onclick) {
  const notification = new window.Notification(title, {
    body: notificationBody,
  })
  notification.onclick = onclick
  return true
}
