import React from 'react'
import NextApp, {Container} from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import GlobalStyle from '../shared/components/global-style'
import {EpochProvider} from '../shared/providers/epoch-context'
import {IdentityProvider} from '../shared/providers/identity-context'
import {NotificationProvider} from '../shared/providers/notification-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {ChainProvider} from '../shared/providers/chain-context'
import {ValidationProvider} from '../shared/providers/validation-context'

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', () => {
  NProgress.done()
})

Router.events.on('routeChangeError', () => {
  NProgress.done()
})

export default class MyApp extends NextApp {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <GlobalStyle />
        <AppProviders>
          <Component {...pageProps} />
        </AppProviders>
      </Container>
    )
  }
}

function AppProviders(props) {
  return (
    <ChainProvider>
      <TimingProvider>
        <NotificationProvider>
          <EpochProvider>
            <IdentityProvider>
              <ValidationProvider {...props} />
            </IdentityProvider>
          </EpochProvider>
        </NotificationProvider>
      </TimingProvider>
    </ChainProvider>
  )
}
