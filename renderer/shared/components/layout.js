/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {backgrounds, margin} from 'polished'
import Sidebar from './sidebar'
import Notifications from './notifications'
import SyncingApp, {OfflineApp, LoadingApp} from './syncing-app'
import {GlobalModals} from './modal'
import {useDebounce} from '../hooks/use-debounce'
import {EpochPeriod, useEpochState} from '../providers/epoch-context'
import {shouldStartValidation} from '../../screens/validation/utils'
import {useIdentityState} from '../providers/identity-context'
import {addWheelHandler} from '../utils/mouse'
import {loadPersistentStateValue, persistItem} from '../utils/persist'
import {DnaSignInDialog, DnaSendDialog, DnaLinkHandler} from './dna-link'
import {useNotificationDispatch} from '../providers/notification-context'
import {ValidationToast} from '../../screens/validation/components'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import Button from './button'
import Flex from './flex'
import {BlockText} from './typo'
import theme, {rem} from '../theme'

global.getZoomLevel = global.getZoomLevel || {}

const AVAILABLE_TIMEOUT = global.isDev ? 0 : 1000 * 5

export default function Layout({
  loading,
  syncing,
  offline,
  skipHardForkScreen = false,
  ...props
}) {
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

  const {addError} = useNotificationDispatch()

  const {nodeRemoteVersion, mustUpdateNode} = useAutoUpdateState()
  const {updateNode} = useAutoUpdateDispatch()

  return (
    <main>
      <Sidebar />
      {loading && <LoadingApp />}
      {!skipHardForkScreen && mustUpdateNode ? (
        <>
          <HardForkScreen version={nodeRemoteVersion} onUpdate={updateNode} />
          <GlobalModals />
        </>
      ) : (
        <>
          {!loading && debouncedSyncing && !debouncedOffline && <SyncingApp />}
          {!loading && debouncedOffline && !debouncedSyncing && <OfflineApp />}
          {!loading && !debouncedOffline && !debouncedSyncing && (
            <NormalApp {...props} />
          )}

          {!debouncedOffline && !loading && (
            <DnaLinkHandler>
              <DnaSignInDialog
                isOpen={url => new URL(url).pathname.includes('signin')}
                onSigninError={error =>
                  addError({
                    title: error,
                  })
                }
              />
            </DnaLinkHandler>
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

function NormalApp(props) {
  const router = useRouter()

  const epoch = useEpochState()
  const identity = useIdentityState()

  React.useEffect(() => {
    if (shouldStartValidation(epoch, identity)) router.push('/validation')
  }, [epoch, identity, router])

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

  const {addNotification, addError} = useNotificationDispatch()

  return (
    <section style={{flex: 1, overflowY: 'auto'}}>
      <div {...props} />

      {epoch && <ValidationToast epoch={epoch} identity={identity} />}

      <Notifications />

      <GlobalModals />

      <DnaLinkHandler>
        <DnaSendDialog
          isOpen={url => new URL(url).pathname.includes('send')}
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
      </DnaLinkHandler>
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

// eslint-disable-next-line react/prop-types
export function HardForkScreen({version, onUpdate}) {
  const {t} = useTranslation()

  return (
    <Flex
      align="center"
      justify="center"
      flex={1}
      css={{
        ...backgrounds(theme.colors.darkGraphite),
      }}
    >
      <Flex direction="column">
        <BlockText
          color={theme.colors.white}
          fontWeight={500}
          fontSize={rem(18)}
          css={{...margin(0, 0, rem(20))}}
        >
          {t('Your node version is outdated, please update')}
        </BlockText>
        <Button variant="primary" onClick={onUpdate}>
          {t('Update Node Version')} {version}
        </Button>
      </Flex>
    </Flex>
  )
}
