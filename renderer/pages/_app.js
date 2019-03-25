import App, {Container} from 'next/app'
import {FlipProvider} from '../providers/flip-provider'
import {NetProvider} from '../providers/net-provider'
import {ContactProvider} from '../providers'

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <NetProvider>
          <ContactProvider>
            <FlipProvider>
              <Component {...pageProps} />
            </FlipProvider>
          </ContactProvider>
        </NetProvider>
      </Container>
    )
  }
}

export default MyApp
