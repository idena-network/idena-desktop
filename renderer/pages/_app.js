import App, {Container} from 'next/app'
import {FlipProvider} from '../providers/flip-provider'

class MyApp extends App {
  render() {
    const {Component, pageProps} = this.props
    return (
      <Container>
        <FlipProvider>
          <Component {...pageProps} />
        </FlipProvider>
      </Container>
    )
  }
}

export default MyApp
