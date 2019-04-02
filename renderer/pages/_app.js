import React from 'react'
import App, {Container} from 'next/app'
import {
  ContactProvider,
  ChatProvider,
  NetProvider,
  FlipProvider,
} from '../providers'

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <NetProvider>
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
