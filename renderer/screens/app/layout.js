/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Box, Text, Button} from '@chakra-ui/core'
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
} from './components'
import {PrimaryButton} from '../../shared/components/button'
import {useAppMachine} from '../../shared/providers/app-context'
import {eitherState} from '../../shared/utils/utils'
import {EpochPeriod} from '../../shared/types'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../../shared/providers/update-context'

export default function AppLayout({children}) {
  const {t} = useTranslation()

  const autoUpdate = useAutoUpdateState()
  const {updateClient, updateNode} = useAutoUpdateDispatch()

  const [current, send] = useAppMachine()

  return (
    <LayoutContainer>
      <PageSidebar>
        {eitherState(
          current,
          'idle',
          'connecting',
          'connected.synced.pull'
        ) && (
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
              <ActionItem title={t('Current task')} roundedBottom="lg">
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
              <Box mt={2}>
                {autoUpdate.nodeUpdating && (
                  <Text color="xwhite.050" mx={2}>
                    {t('Updating Node...')}
                  </Text>
                )}
                {autoUpdate.canUpdateClient ? (
                  <Button
                    bg="white"
                    color="brandGray.500"
                    fontWeight={400}
                    _hover={null}
                    onClick={updateClient}
                  >
                    {t('Update Client Version')}
                    <br />
                    {autoUpdate.uiRemoteVersion}
                  </Button>
                ) : null}
                {!autoUpdate.canUpdateClient &&
                autoUpdate.canUpdateNode &&
                (!autoUpdate.nodeProgress ||
                  autoUpdate.nodeProgress.percentage === 100) ? (
                  <Button
                    bg="white"
                    color="brandGray.500"
                    fontWeight={400}
                    _hover={null}
                    onClick={updateNode}
                  >
                    {t('Update Node Version')}
                    <br />
                    {autoUpdate.nodeRemoteVersion}
                  </Button>
                ) : null}
              </Box>
            </VersionPanel>
          </>
        )}
      </PageSidebar>

      {current.matches('idle') && (
        <Page>
          <PrimaryButton onClick={() => send('CONNECT')}>Connect</PrimaryButton>
        </Page>
      )}

      {current.matches('connecting') && <Page>Establishing connection...</Page>}

      {current.matches('connected.syncing') && <Page>Syncing...</Page>}

      {current.matches('offline') && (
        <OfflineApp onRetry={() => send('RETRY')} />
      )}

      {current.matches('connected.synced.ready') && children}
    </LayoutContainer>
  )
}

export function getLayout(page) {
  return <AppLayout>{page}</AppLayout>
}
