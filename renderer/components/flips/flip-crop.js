import React, {Component} from 'react'
import ReactCrop from 'react-image-crop'

export class FlipCrop extends Component {
  state = {
    crop: {
      aspect: 1,
      width: 100,
      x: 0,
      y: 0,
    },
    pixelCrop: {},
  }

  handleImageLoad = (image, _pixelCrop) => {
    this.imageRef = image
    this.imageSrc = image.getAttribute('src')
  }

  handleCropComplete = (_crop, pixelCrop) => {
    this.setState({pixelCrop})
    this.props.onCropChange(this.imageSrc, pixelCrop)
  }

  handleCropChange = crop => {
    this.setState({crop})
  }

  handleCropSave = () => {
    const {crop, pixelCrop} = this.state
    if (this.imageRef && crop.width && crop.height) {
      this.props.onCropSave(this.imageSrc, pixelCrop)
    }
  }

  render() {
    const {src} = this.props
    const {crop} = this.state
    return (
      <>
        <ReactCrop
          src={src}
          crop={crop}
          onImageLoaded={this.handleImageLoad}
          onComplete={this.handleCropComplete}
          onChange={this.handleCropChange}
        />
        <button onClick={this.handleCropSave}>Save</button>
      </>
    )
  }
}
