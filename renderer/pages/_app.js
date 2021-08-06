/* eslint-disable react/prop-types */
import React from 'react'
import Router from 'next/router'
import Head from 'next/head'
import {ThemeProvider, CSSReset} from '@chakra-ui/core'
import NProgress from 'nprogress'
import GoogleFonts from 'next-google-fonts'
// eslint-disable-next-line import/no-extraneous-dependencies
import 'tui-image-editor/dist/tui-image-editor.css'
import '../i18n'
import {uiTheme} from '../shared/theme'
import {NodeProvider} from '../shared/providers/node-context'
import {SettingsProvider} from '../shared/providers/settings-context'
import {AutoUpdateProvider} from '../shared/providers/update-context'
import {ChainProvider} from '../shared/providers/chain-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {EpochProvider} from '../shared/providers/epoch-context'
import {IdentityProvider} from '../shared/providers/identity-context'
import {VotingNotificationProvider} from '../shared/providers/voting-notification-context'
import {OnboardingProvider} from '../shared/providers/onboarding-context'

// err is a workaround for https://github.com/zeit/next.js/issues/8592
export default function App({Component, err, ...pageProps}) {
  return (
    <>
      <GoogleFonts href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
      <Head>
        <link href="/static/fonts/icons.css" rel="stylesheet" />
        <link href="/static/scrollbars.css" rel="stylesheet" />
      </Head>

      <ThemeProvider theme={uiTheme}>
        <CSSReset />
        <AppProviders>
          <Component err={err} {...pageProps} />
        </AppProviders>
      </ThemeProvider>
    </>
  )
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
                  <OnboardingProvider>
                    <VotingNotificationProvider {...props} />
                  </OnboardingProvider>
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
