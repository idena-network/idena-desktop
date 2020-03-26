import React from 'react'
import App from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import '../i18n'

import GlobalStyle from '../shared/components/global-style'
import {EpochProvider} from '../shared/providers/epoch-context'
import {IdentityProvider} from '../shared/providers/identity-context'
import {NotificationProvider} from '../shared/providers/notification-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {ChainProvider} from '../shared/providers/chain-context'
import {ValidationProvider} from '../shared/providers/validation-context'
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
      <>
        <GlobalStyle />
        <AppProviders>
          <Component {...{...pageProps, err}} />
        </AppProviders>
      </>
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
                  <ValidationProvider>
                    <NotificationProvider {...props} />
                  </ValidationProvider>
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
