import {Component} from 'react'
import {FlipEditor} from '../components/flips'
import {Layout} from '../components/layout'

export default class extends Component {
  render() {
    return (
      <Layout>
        <FlipEditor />
      </Layout>
    )
  }
}
