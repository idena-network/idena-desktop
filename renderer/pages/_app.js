import App, {Container} from 'next/app'
import {FlipProvider} from '../providers/flip-provider'
import {NetProvider} from '../providers/net-provider'
import {ContactProvider, ChatProvider} from '../providers'

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
