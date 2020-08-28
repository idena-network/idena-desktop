/* eslint-disable react/prop-types */
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
import {appMachine} from '../screens/app/machines'
import {AppMachineProvider} from '../shared/providers/app-context'
import {getDefaultLayout} from '../screens/app/layout'

// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-image-editor/dist/tui-image-editor.css'

// err is a workaround for https://github.com/zeit/next.js/issues/8592
export default function App({Component, err, ...pageProps}) {
  const [currentApp, , appService] = useMachine(appMachine)

  const getLayout = Component.getLayout || getDefaultLayout

  return (
    <>
      <GoogleFonts href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
      <Head>
        <link href="/static/fonts/icons.css" rel="stylesheet" />
      </Head>

      <SettingsProvider>
        <AutoUpdateProvider>
          <NodeProvider>
            <NotificationProvider>
              <ThemeProvider theme={uiTheme}>
                <CSSReset />
                <AppMachineProvider value={appService}>
                  {getLayout(
                    <Component err={err} {...pageProps} />,
                    currentApp
                  )}
                </AppMachineProvider>
              </ThemeProvider>
            </NotificationProvider>
          </NodeProvider>
        </AutoUpdateProvider>
      </SettingsProvider>
    </>
  )
}

Router.events.on('routeChangeStart', NProgress.start)
Router.events.on('routeChangeComplete', NProgress.done)
Router.events.on('routeChangeError', NProgress.done)
