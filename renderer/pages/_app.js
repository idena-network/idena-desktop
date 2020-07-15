import React from 'react'
import App from 'next/app'
import Router from 'next/router'
import Head from 'next/head'
import {ThemeProvider, CSSReset, ColorModeProvider} from '@chakra-ui/core'
import NProgress from 'nprogress'
import GoogleFonts from 'next-google-fonts'

import '../i18n'

import {uiTheme} from '../shared/theme'

import {EpochProvider} from '../shared/providers/epoch-context'
import {IdentityProvider} from '../shared/providers/identity-context'
import {NotificationProvider} from '../shared/providers/notification-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {ChainProvider} from '../shared/providers/chain-context'
import {NodeProvider} from '../shared/providers/node-context'
import {SettingsProvider} from '../shared/providers/settings-context'
import {AutoUpdateProvider} from '../shared/providers/update-context'

// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-image-editor/dist/tui-image-editor.css'

export default class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props

    // Workaround for https://github.com/zeit/next.js/issues/8592
    const {err} = this.props

    return (
      <ThemeProvider theme={uiTheme}>
        <ColorModeProvider>
          <GoogleFonts href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" />
          <Head>
            <link href="/static/fonts/icons.css" rel="stylesheet" />
          </Head>
          <CSSReset />
          <AppProviders>
            <Component {...{...pageProps, err}} />
          </AppProviders>
        </ColorModeProvider>
      </ThemeProvider>
    )
  }
}

function AppProviders(props) {
  return (
    <SettingsProvider>
      <AutoUpdateProvider>
        <NodeProvider>
          <ChainProvider>
            <TimingProvider>
              <EpochProvider>
                <IdentityProvider>
                  <NotificationProvider {...props} />
                </IdentityProvider>
              </EpochProvider>
            </TimingProvider>
          </ChainProvider>
        </NodeProvider>
      </AutoUpdateProvider>
    </SettingsProvider>
  )
}

Router.events.on('routeChangeStart', NProgress.start)
Router.events.on('routeChangeComplete', NProgress.done)
Router.events.on('routeChangeError', NProgress.done)
