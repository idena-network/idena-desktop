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
import Error from './_error'

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
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: undefined,
    }
  }

  static async getInitialProps({Component, ctx}) {
    try {
      let pageProps = {}

      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx)
      }

      return {pageProps}
    } catch (error) {
      global.logger.error(error, ctx)
      return {
        hasError: true,
        error,
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      hasError: props.hasError || state.hasError || false,
      error: props.error || state.error || undefined,
    }
  }

  static getDerivedStateFromError() {
    return {hasError: true}
  }

  componentDidCatch(error, errorInfo) {
    this.setState({error})
    global.logger.error(error, errorInfo)
  }

  render() {
    const {Component, pageProps} = this.props
    const {hasError, error} = this.state
    return (
      <Container>
        <GlobalStyle />
        <AppProviders>
          {hasError ? (
            <Error err={error && error.props} />
          ) : (
            <Component {...pageProps} />
          )}
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
