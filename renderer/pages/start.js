import {Component} from 'react'
import main from '../styles/main'
import {FlipEditor} from '../components/flips'

export default class extends Component {
  render() {
    return (
      <main>
        <FlipEditor />
        <style jsx>{main}</style>
      </main>
    )
  }
}
