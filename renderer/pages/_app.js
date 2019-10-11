import React from 'react'
import App, {Container} from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import GlobalStyle from '../shared/components/global-style'
import {EpochProvider} from '../shared/providers/epoch-context'
import {IdentityProvider} from '../shared/providers/identity-context'
import {NotificationProvider} from '../shared/providers/notification-context'
import {TimingProvider} from '../shared/providers/timing-context'
import {ChainProvider} from '../shared/providers/chain-context'
import {ValidationProvider} from '../shared/providers/validation-context'

export default class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props

    // Workaround for https://github.com/zeit/next.js/issues/8592
    const {err} = this.props
    const modifiedPageProps = {...pageProps, err}

    return (
      <Container>
        <GlobalStyle />
        <AppProviders>
          <Component {...modifiedPageProps} />
        </AppProviders>
      </Container>
    )
  }
}

function AppProviders(props) {
  return (
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
  )
}

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', () => {
  NProgress.done()
})

Router.events.on('routeChangeError', () => {
  NProgress.done()
})
