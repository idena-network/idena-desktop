import React, {Component} from 'react'
import {func, bool} from 'prop-types'

import {useSafe} from '../../../shared/utils/fn'

class FlipDrop extends Component {
  onHide = useSafe(this.props.onHide)

  handleDragOver = e => {
    // Make the cursor look good
    e.dataTransfer.effectAllowed = 'copyMove'
    e.dataTransfer.dropEffect = 'copy'

    e.preventDefault()
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
        onDrop={this.onHide}
      >
        <section className={this.props.darkMode ? 'dark' : ''}>
          <span>
            <h1>Drop to Submit FLIPs</h1>
            <p>
              Your pictures will be uploaded to <b>Idena</b>.
            </p>
          </span>
        </section>
      </aside>
    )
  }
}

FlipDrop.propTypes = {
  darkMode: bool,
  onDrop: func.isRequired,
  onHide: func,
}
