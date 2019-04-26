import React from 'react'
import App, {Container} from 'next/app'
import Router from 'next/router'
import {NetProvider} from '../shared/providers/net-provider'

let idx = 0

Router.events.on('routeChangeComplete', () => {
  idx += 1
})

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <NetProvider key={`net-provider-${idx}`}>
          <Component {...pageProps} />
        </NetProvider>
      </Container>
    )
  }
}

export default MyApp
