/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {Flex, Text} from '@chakra-ui/core'
import Sidebar from './sidebar'
import Notifications from './notifications'
import SyncingApp, {OfflineApp, LoadingApp} from './syncing-app'
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
import {PrimaryButton} from './button'
import {
  LayoutContainer,
  UpdateExternalNodeDialog,
} from '../../screens/app/components'

global.getZoomLevel = global.getZoomLevel || {}

const AVAILABLE_TIMEOUT = global.isDev || global.isTest ? 0 : 1000 * 5

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
    <LayoutContainer>
      <Sidebar />
      {loading && <LoadingApp />}
      {!loading && !skipHardForkScreen && mustUpdateNode ? (
        <HardForkScreen version={nodeRemoteVersion} onUpdate={updateNode} />
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

      <UpdateExternalNodeDialog />
    </LayoutContainer>
  )
}

function NormalApp({children}) {
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
    <Flex as="section" direction="column" flex={1} h="100vh" overflowY="auto">
      {children}

      {epoch && <ValidationToast epoch={epoch} identity={identity} />}

      <Notifications />

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
    </Flex>
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

function HardForkScreen({version, onUpdate}) {
  const {t} = useTranslation()

  return (
    <Flex align="center" justify="center" flex={1} background="brandGray.500">
      <Flex direction="column">
        <Text fontSize="md" fontWeight={500} mb={5}>
          {t('Your node is outdated because of the hard fork, please update')}
        </Text>
        <PrimaryButton onClick={onUpdate}>
          {t('Update Node Version')} {version}
        </PrimaryButton>
      </Flex>
    </Flex>
  )
}
