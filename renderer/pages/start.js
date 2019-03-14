import {Component} from 'react'
import {FlipEditor} from '../components/flips'
import {Layout} from '../components/layout'
import GlobalStyle from '../global-style'

export default class extends Component {
  render() {
    return (
      <Layout>
        <FlipEditor />
        <GlobalStyle />
      </Layout>
    )
  }
}
