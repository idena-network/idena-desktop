/* eslint-disable react/prop-types */
import React from 'react'
import Router from 'next/router'
import Head from 'next/head'
import {ThemeProvider, CSSReset, Box, Text} from '@chakra-ui/core'
import NProgress from 'nprogress'
import GoogleFonts from 'next-google-fonts'
import '../i18n'
import {useMachine} from '@xstate/react'
import {useTranslation} from 'react-i18next'
import {uiTheme} from '../shared/theme'
import {NotificationProvider} from '../shared/providers/notification-context'
import {NodeProvider} from '../shared/providers/node-context'
import {SettingsProvider} from '../shared/providers/settings-context'
import {
  AutoUpdateProvider,
  useAutoUpdate,
} from '../shared/providers/update-context'
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-image-editor/dist/tui-image-editor.css'
import {appMachine} from '../screens/app/machines'
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
} from '../screens/app/components'
import {PrimaryButton} from '../shared/components/button'
import {AppMachineProvider} from '../shared/providers/app-context'
import {eitherState} from '../shared/utils/utils'
import {EpochPeriod} from '../shared/types'

// err is a workaround for https://github.com/zeit/next.js/issues/8592
export default function App({Component, err, ...pageProps}) {
  return (
    <ThemeProvider theme={uiTheme}>
      <GoogleFonts href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
      <Head>
        <link href="/static/fonts/icons.css" rel="stylesheet" />
      </Head>
      <CSSReset />

      <SettingsProvider>
        <AutoUpdateProvider>
          <NodeProvider>
            <NotificationProvider>
              <AppLayout>
                <Component err={err} {...pageProps} />
              </AppLayout>
            </NotificationProvider>
          </NodeProvider>
        </AutoUpdateProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

function AppLayout(props) {
  const {t} = useTranslation()

  const [autoUpdate, {updateClient, updateNode}] = useAutoUpdate()

  const [current, send, appService] = useMachine(appMachine)

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

      {current.matches('connected.synced.ready') && (
        <AppMachineProvider value={appService}>
          {/* eslint-disable-next-line react/destructuring-assignment */}
          {props.children}
        </AppMachineProvider>
      )}
    </LayoutContainer>
  )
}

Router.events.on('routeChangeStart', NProgress.start)
Router.events.on('routeChangeComplete', NProgress.done)
Router.events.on('routeChangeError', NProgress.done)
