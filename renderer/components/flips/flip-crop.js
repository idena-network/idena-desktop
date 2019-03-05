import React, {Component} from 'react'
import Cropper from 'react-cropper'
import PropTypes from 'prop-types'

import 'cropperjs/dist/cropper.css'

export class FlipCrop extends Component {
  handleCrop = ev => {
    const {width, height} = ev.detail
    const {cropSize} = this.props
    if (width !== cropSize || height !== cropSize) {
      this.refs.cropper.setData({
        width: cropSize,
        height: cropSize,
      })
    }
  }

  handleSubmitCrop = () => {
    this.refs.cropper.getCroppedCanvas().toBlob(blob => {
      this.props.onSubmit(blob)
    })
  }

  render() {
    const {src, disabled} = this.props
    return (
      <>
        <Cropper
          ref="cropper"
          src={src}
          viewMode={0}
          aspectRatio={1}
          cropBoxResizable={false}
          crop={this.handleCrop}
        />
        <button onClick={this.handleSubmitCrop} disabled={disabled}>
          Add to set
        </button>
      </>
    )
  }
}

FlipCrop.defaultProps = {
  cropSize: 300,
}

FlipCrop.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}
