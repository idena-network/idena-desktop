import App, {Container} from 'next/app'
import {FlipProvider} from '../providers/flip-provider'
import {NetProvider} from '../providers/net-provider'

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <NetProvider>
          <FlipProvider>
            <Component {...pageProps} />
          </FlipProvider>
        </NetProvider>
      </Container>
    )
  }
}

export default MyApp
