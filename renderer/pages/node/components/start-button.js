import React from 'react'
import PropTypes from 'prop-types'
import {Button} from '../../../shared/components'

function StartButton({address, onStart}) {
  return (
    <Button size={0.7} onClick={onStart}>
      <span role="img" aria-labelledby="Start node">
        ▶️ on {address}
      </span>
    </Button>
  )
}

StartButton.propTypes = {
  address: PropTypes.string,
  onStart: PropTypes.func,
}

export default StartButton
