import React from 'react'
import App, {Container} from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'

import {NetProvider} from '../shared/providers/net-provider'
import GlobalStyle from '../components/global-style'
import NProgressStyle from '../components/nprogress-style'
import NotificationProvider from '../shared/providers/notification-provider'
import ValidationProvider from '../shared/providers/validation-provider'

let idx = 0

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', () => {
  NProgress.done()
  idx += 1
})

Router.events.on('routeChangeError', () => {
  NProgress.done()
})

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <GlobalStyle />
        <NProgressStyle />
        <NotificationProvider>
          <NetProvider key={`net-provider-${idx}`}>
            <ValidationProvider>
              <Component {...pageProps} />
            </ValidationProvider>
          </NetProvider>
        </NotificationProvider>
      </Container>
    )
  }
}

export default MyApp
