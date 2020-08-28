/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Box, Text} from '@chakra-ui/core'
import {
  LayoutContainer,
  PageSidebar,
  ConnectionStatus,
  ConnectionStatusText,
  Bandwidth,
  Logo,
  Nav,
  NavItem,
  ActionPanel,
  ActionItem,
  CurrentTask,
  VersionPanel,
  VersionText,
  Page,
  OfflineApp,
  UpdateButton,
} from './components'
import {PrimaryButton} from '../../shared/components/button'
import {eitherState} from '../../shared/utils/utils'
import {EpochPeriod} from '../../shared/types'
import {useAutoUpdate} from '../../shared/providers/update-context'
import {useAppMachine} from '../../shared/providers/app-context'

export function AppSidebar({fallbackApp}) {
  const {t} = useTranslation()

  const [current = fallbackApp] = useAppMachine()

  const [autoUpdate, {updateClient, updateNode}] = useAutoUpdate()

  return (
    <PageSidebar>
      {eitherState(current, 'idle', 'connecting', 'connected.synced.pull') && (
        <ConnectionStatus bg="xblack.016">
          <ConnectionStatusText color="xwhite.050">
            {t('Idle')}
          </ConnectionStatusText>
        </ConnectionStatus>
      )}

      {current.matches('offline') && (
        <ConnectionStatus bg="red.020">
          <ConnectionStatusText color="red.500">
            {t('Offline')}
          </ConnectionStatusText>
        </ConnectionStatus>
      )}

      {current.matches('connected.syncing') && (
        <ConnectionStatus bg="warning.100" color="warning.400">
          <Bandwidth strength={2} color="warning" />
          <ConnectionStatusText>{t('Syncing')}</ConnectionStatusText>
        </ConnectionStatus>
      )}

      {current.matches('connected.synced.ready') && (
        <ConnectionStatus bg="success.100">
          <Bandwidth strength={3} color="success" />
          <ConnectionStatusText color="success.400">
            {t('Connected')}
          </ConnectionStatusText>
        </ConnectionStatus>
      )}

      <Logo />

      <Nav>
        <NavItem href="/profile" icon="profile">
          {t('My Idena')}
        </NavItem>
        <NavItem href="/flips/list" icon="gallery">
          {t('Flips')}
        </NavItem>
        <NavItem href="/wallets" icon="wallet">
          {t('Wallets')}
        </NavItem>
        <NavItem href="/contacts" icon="contacts">
          {t('Contacts')}
        </NavItem>
        <NavItem href="/oracles/list" icon="oracle">
          {t('Oracle')}
        </NavItem>
        <NavItem href="/settings" icon="settings">
          {t('Settings')}
        </NavItem>
      </Nav>

      {current.matches('connected.synced.ready') && (
        <>
          <ActionPanel>
            {current.context.epoch.currentPeriod !== EpochPeriod.None && (
              <ActionItem
                title={t('Current period')}
                value={current.context.epoch.currentPeriod}
                roundedTop="lg"
              />
            )}
            <ActionItem title={t('Current task')} roundedTop="lg">
              <CurrentTask {...current.context} />
            </ActionItem>

            {current.context.epoch.currentPeriod === EpochPeriod.None && (
              <ActionItem
                title={t('Next validation')}
                value={new Date(
                  current.context.epoch.nextValidation
                ).toLocaleString()}
                roundedBottom="lg"
              />
            )}
          </ActionPanel>
          <VersionPanel>
            <VersionText>
              {t('Client version')}: {global.appVersion}
            </VersionText>
            <VersionText>
              {t('Node version')}: {autoUpdate.nodeCurrentVersion}
            </VersionText>
          </VersionPanel>
          <Box mt={2}>
            {autoUpdate.nodeUpdating && (
              <Text color="xwhite.050" mx={2}>
                {t('Updating Node...')}
              </Text>
            )}
            {autoUpdate.canUpdateClient && (
              <UpdateButton
                version={autoUpdate.uiRemoteVersion}
                onClick={updateClient}
              >
                {t('Update Client version')}
              </UpdateButton>
            )}
            {!autoUpdate.canUpdateClient &&
              autoUpdate.canUpdateNode &&
              (!autoUpdate.nodeProgress ||
                autoUpdate.nodeProgress.percentage === 100) && (
                <UpdateButton
                  version={autoUpdate.nodeRemoteVersion}
                  onClick={updateNode}
                >
                  {t('Update Node version')}
                </UpdateButton>
              )}
          </Box>
        </>
      )}
    </PageSidebar>
  )
}

export function AppBody({fallbackApp, children}) {
  const {t} = useTranslation()

  const [current = fallbackApp, send] = useAppMachine()

  return (
    <>
      {current.matches('idle') && (
        <Page>
          <PrimaryButton onClick={() => send('CONNECT')}>
            {t('Connect')}
          </PrimaryButton>
        </Page>
      )}

      {current.matches('connecting') && (
        <Page>{t('Establishing connection...')}</Page>
      )}

      {current.matches('connected.syncing') && <Page>{t('Syncing...')}</Page>}

      {current.matches('offline') && (
        <OfflineApp
          onStartingBuiltinNode={() => send('START_BUILTIN_NODE')}
          onReconnect={() => send('RETRY')}
        />
      )}

      {current.matches('connected.synced.ready') && children}
    </>
  )
}

export function getDefaultLayout(page, fallbackApp) {
  return getLayout(
    <AppBody fallbackApp={fallbackApp}>{page}</AppBody>,
    fallbackApp
  )
}

export function getLayout(page, fallbackApp) {
  return (
    <LayoutContainer>
      <AppSidebar fallbackApp={fallbackApp} />
      {page}
    </LayoutContainer>
  )
}
