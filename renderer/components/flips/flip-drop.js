import {Component} from 'react'
import {func, bool} from 'prop-types'

import styles from '../../styles/components/flips/flip-drop'
import {submitFlip} from '../../services/api'

class FlipDrop extends Component {
  handleDragLeave = () => {
    this.onHide()
  }

  handleDragOver = e => {
    this.preventDefault(e)
  }

  handleDrop = e => {
    this.onHide()
    this.props.onDrop(e)
  }

  render() {
    return (
      <aside
        onDragLeave={this.handleDragLeave}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        <section className={this.props.darkMode ? 'dark' : ''}>
          <span>
            <h1>Drop to Submit FLIPs</h1>
            <p>
              Your pictures will be uploaded to <b>Idena</b>.
            </p>
          </span>
        </section>

        <style jsx>{styles}</style>
      </aside>
    )
  }

  preventDefault = event => {
    // Make the cursor look good
    event.dataTransfer.effectAllowed = 'copyMove'
    event.dataTransfer.dropEffect = 'copy'

    event.preventDefault()
  }

  onHide = () => this.props.onHide && this.props.onHide()
}

FlipDrop.propTypes = {
  darkMode: bool,
  onDrop: func.isRequired,
  onHide: func,
}

export default FlipDrop
