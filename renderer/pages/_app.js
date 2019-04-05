import React from 'react'
import App, {Container} from 'next/app'
import Router from 'next/router'
import {
  ContactProvider,
  ChatProvider,
  NetProvider,
  FlipProvider,
} from '../providers'

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
          <ContactProvider>
            <ChatProvider>
              <FlipProvider>
                <Component {...pageProps} />
              </FlipProvider>
            </ChatProvider>
          </ContactProvider>
        </NetProvider>
      </Container>
    )
  }
}

export default MyApp
