import React, {Component} from 'react'
import ReactCrop from 'react-image-crop'

import {useSafe} from '../../utils/fn'
import styles from '../../styles/components/flips/flip-crop'

export class FlipCrop extends Component {
  state = {
    crop: {
      aspect: 1,
      width: 25,
      x: 0,
      y: 0,
    },
  }

  onChange = useSafe(this.props.onChange)

  handleImageLoad = (image, _pixelCrop) => {
    this.imageRef = image
    this.imageSrc = image.getAttribute('src')
  }

  handleCropComplete = (_crop, pixelCrop) => {
    this.setState({pixelCrop})
    this.onChange(this.imageSrc, pixelCrop)
  }

  handleCropChange = crop => {
    this.setState({crop})
    this.onChange(this.imageSrc, crop)
  }

  handleCropSave = () => {
    const {crop, pixelCrop} = this.state
    if (this.imageRef && crop.width && crop.height) {
      this.props.onCropSave(this.imageSrc, pixelCrop)
    }
  }

  render() {
    const {src, disabled} = this.props
    const {crop} = this.state
    return (
      <>
        <ReactCrop
          src={src}
          crop={crop}
          minWidth={25}
          maxWidth={100}
          onImageLoaded={this.handleImageLoad}
          onComplete={this.handleCropComplete}
          onChange={this.handleCropChange}
        />
        <button onClick={this.handleCropSave} disabled={disabled}>
          Add to set
        </button>
        <style jsx>{styles}</style>
      </>
    )
  }
}
