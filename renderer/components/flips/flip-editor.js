//@ts-check

import React, {Component} from 'react'

import {FlipCrop} from './flip-crop'
import {FlipDrop} from './flip-drop'
import {FlipRenderer} from './flip-renderer'

import * as api from '../../services/api'
import '../../styles/components/flips/flip-editor'
import {arrToFormData} from '../../utils/req'
import {bufferToHex} from '../../utils/string'

export class FlipEditor extends Component {
  state = {
    showDropZone: false,
    origSrc: '',
    src: '',
    pixelCrop: {},
    imgIdx: -1,
  }

  handleUpload = e => {
    e.preventDefault()

    const files = e.target.files || e.dataTransfer.files

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.indexOf('image') == 0) {
        const reader = new FileReader()
        reader.addEventListener('load', e => {
          if (i === files.length - 1) {
            this.setState(() => ({
              origSrc: e.target.result,
            }))
            // api.submitFlip(hex).then(console.log)
          }
        })
        // reader.readAsArrayBuffer(file)
        reader.readAsDataURL(file)
      }
    }
  }

  handleDrop = files => {
    api.submitFlip(arrToFormData(files))
  }

  handleCropChange = (image, crop) => {
    // console.log(image, crop)
  }

  handleCropSave = (image, crop) => {
    this.setState(({imgIdx}) => ({
      src: image,
      crop,
      imgIdx: imgIdx + 1,
    }))
  }

  handleSubmitFlip = () => {
    const ctx = this.canvasRef.getContext('2d')
    const buff = ctx.getImageData(
      0,
      0,
      this.canvasRef.width,
      this.canvasRef.height
    ).data.buffer
    const hex = bufferToHex(buff)
    console.log(hex)
  }

  render() {
    const {showDropZone, origSrc, src, crop, imgIdx} = this.state
    return (
      <>
        <h2>FLIPs</h2>
        <div onDragEnter={this.showDropZone} className="flips">
          {showDropZone && (
            <FlipDrop
              darkMode={false}
              onDrop={this.handleUpload}
              onHide={this.hideDropZone}
            />
          )}
          Drag and drop your pics here or upload manually{' '}
          <input type="file" onChange={this.handleUpload} />
          {origSrc && (
            <div>
              <FlipCrop
                src={origSrc}
                onCropChange={this.handleCropChange}
                onCropSave={this.handleCropSave}
              />
              <button onClick={this.handleSubmitFlip}>submit</button>
              <FlipRenderer
                src={src}
                crop={crop}
                imgIdx={imgIdx}
                canvasRef={node => (this.canvasRef = node)}
              />
            </div>
          )}
        </div>
      </>
    )
  }

  showDropZone = () => this.setState({showDropZone: true})

  hideDropZone = () => this.setState({showDropZone: false})
}
