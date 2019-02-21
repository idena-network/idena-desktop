//@ts-check

import React, {Component} from 'react'
import {encode} from 'rlp'

import * as api from '../../services/api'
import styles from '../../styles/components/flips/flip-editor'
import {arrToFormData} from '../../utils/req'
import {FlipCrop} from './flip-crop'
import {FlipDrop} from './flip-drop'
import {FlipRenderer} from './flip-renderer'
import {createFlip} from '../../services/flipotron'

export class FlipEditor extends Component {
  state = {
    showDropZone: false,
    origSrc: '',
    canUpload: true,
    flip: createFlip(new Array(4)),
  }

  canvasRefs = []
  idx = 0

  handleUpload = e => {
    e.preventDefault()

    const file = (e.target.files || e.dataTransfer.files)[0]

    if (file && file.type.indexOf('image') !== 0) {
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

  handleCropSave = (src, crop) =>
    this.state.canUpload &&
    this.setState(
      ({flip}) => {
        flip.flips[this.idx] = {
          src,
          crop,
        }
        return {
          flip,
          canUpload: this.idx < flip.flips.length - 1,
        }
      },
      () => {
        this.idx++
      }
    )

  handleSubmitFlip = () => {
    let arr = []
    for (const canvas of this.canvasRefs) {
      const ctx = canvas.getContext('2d')
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      arr.push(Buffer.from(data))
    }
    const hex = encode([...arr, [1, 2, 3, 4], [2, 1, 3, 4]])
    const hash = api.submitFlip(hex)
    console.log(hash)
  }

  render() {
    const {
      showDropZone,
      origSrc,
      flip: {name, flips},
    } = this.state
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
          <input
            type="file"
            onChange={this.handleUpload}
            disabled={!this.state.canUpload}
          />
        </div>
        {origSrc && (
          <div>
            <FlipCrop
              src={origSrc}
              onCropSave={this.handleCropSave}
              disabled={!this.state.canUpload}
            />
            <button onClick={this.handleSubmitFlip}>Submit</button>
            <h2>{name}</h2>
            {flips.map((pic, idx) => (
              <FlipRenderer
                key={idx}
                {...pic}
                id={`canvas${idx}`}
                canvasRef={node => this.canvasRefs.push(node)}
              />
            ))}
          </div>
        )}
        <style jsx>{styles}</style>
      </>
    )
  }

  showDropZone = () => this.setState({showDropZone: true})

  hideDropZone = () => this.setState({showDropZone: false})
}
