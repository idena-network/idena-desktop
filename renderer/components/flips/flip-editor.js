//@ts-check

import React, {Component} from 'react'

import {FlipCrop} from './flip-crop'
import {FlipDrop} from './flip-drop'
import {FlipRenderer} from './flip-renderer'

import * as api from '../../services/api'
import styles from '../../styles/components/flips/flip-editor'
import {arrToFormData} from '../../utils/req'
import {bufferToHex} from '../../utils/string'

export class FlipEditor extends Component {
  state = {
    showDropZone: false,
    origSrc: '',
    first: {
      src: '',
      crop: '',
    },
    second: {
      src: '',
      crop: '',
    },
    category: 'before/after',
    idx: 0,
  }

  handleUpload = e => {
    e.preventDefault()

    const file = (e.target.files || e.dataTransfer.files)[0]

    if (file.type.indexOf('image') !== 0) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', e => {
      this.setState({
        // @ts-ignore
        origSrc: e.target.result,
      })
    })
    reader.readAsDataURL(file)
  }

  handleDrop = files => {
    api.submitFlip(arrToFormData(files))
  }

  handleCropSave = (src, crop) => {
    this.setState(({idx}) => ({
      [idx % 2 === 0 ? 'first' : 'second']: {
        src,
        crop,
      },
      idx: idx + 1,
    }))
  }

  handleSubmitFlip = () => {
    let hexList = []
    for (const canvas of [this.canvasRef, this.canvasRef2]) {
      const ctx = canvas.getContext('2d')
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      hexList.push(bufferToHex(data.buffer))
    }
  }

  render() {
    const {showDropZone, origSrc, first, second, category} = this.state
    return (
      <>
        <h2>FLIPs</h2>
        <div onDragEnter={this.showDropZone}>
          {showDropZone && (
            <FlipDrop
              darkMode={false}
              onDrop={this.handleUpload}
              onHide={this.hideDropZone}
            />
          )}
          Drag and drop your pics here or upload manually{' '}
          <input type="file" onChange={this.handleUpload} />
        </div>
        {origSrc && (
          <div>
            <FlipCrop src={origSrc} onCropSave={this.handleCropSave} />
            <button onClick={this.handleSubmitFlip}>Submit</button>
            <h2>{category}</h2>
            <FlipRenderer
              {...first}
              idx={'canvas0'}
              canvasRef={node => (this.canvasRef = node)}
            />
            <FlipRenderer
              {...second}
              idx={'canvas1'}
              canvasRef={node => (this.canvasRef2 = node)}
            />
          </div>
        )}
        <style jsx>{styles}</style>
      </>
    )
  }

  showDropZone = () => this.setState({showDropZone: true})

  hideDropZone = () => this.setState({showDropZone: false})
}
