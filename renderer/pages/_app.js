import React from 'react'
import Router from 'next/router'
import Head from 'next/head'
import {ThemeProvider, CSSReset} from '@chakra-ui/core'
import NProgress from 'nprogress'
import GoogleFonts from 'next-google-fonts'
import '../i18n'
import {useMachine} from '@xstate/react'
import {uiTheme} from '../shared/theme'
import {NotificationProvider} from '../shared/providers/notification-context'
import {NodeProvider} from '../shared/providers/node-context'
import {SettingsProvider} from '../shared/providers/settings-context'
import {AutoUpdateProvider} from '../shared/providers/update-context'

// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-image-editor/dist/tui-image-editor.css'
import {appMachine} from '../screens/app/machines'
import {Page} from '../screens/app/components'
import {PrimaryButton} from '../shared/components/button'
import {AppMachineProvider} from '../shared/providers/app-context'

// eslint-disable-next-line react/prop-types
export default function App({Component, err, ...pageProps}) {
  // err is a workaround for https://github.com/zeit/next.js/issues/8592

  const [currentApp, sendApp, appService] = useMachine(appMachine)

  return (
    <ThemeProvider theme={uiTheme}>
      <GoogleFonts href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
      <Head>
        <link href="/static/fonts/icons.css" rel="stylesheet" />
      </Head>
      <CSSReset />

      {currentApp.matches('idle') && (
        <Page>
          <PrimaryButton onClick={() => sendApp('CONNECT')}>
            Connect
          </PrimaryButton>
        </Page>
      )}

      {currentApp.matches('connected.synced.ready') && (
        <AppProviders>
          <AppMachineProvider value={appService}>
            <Component err={err} {...pageProps} appService={appService} />
          </AppMachineProvider>
        </AppProviders>
      )}
    </ThemeProvider>
  )
}

function AppProviders(props) {
  return (
    <SettingsProvider>
      <AutoUpdateProvider>
        <NodeProvider>
          <NotificationProvider {...props} />
        </NodeProvider>
      </AutoUpdateProvider>
    </SettingsProvider>
  )
}

Router.events.on('routeChangeStart', NProgress.start)
Router.events.on('routeChangeComplete', NProgress.done)
Router.events.on('routeChangeError', NProgress.done)
