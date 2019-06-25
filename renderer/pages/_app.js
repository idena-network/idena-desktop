import React from 'react'
import App, {Container} from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'

import GlobalStyle from '../components/global-style'
import NProgressStyle from '../components/nprogress-style'
import NotificationProvider from '../shared/providers/notification-provider'

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', () => {
  NProgress.done()
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
          <Component {...pageProps} />
        </NotificationProvider>
      </Container>
    )
  }
}

export default MyApp
