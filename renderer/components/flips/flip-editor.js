import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {decode, encode} from 'rlp'
import channels from '../../../main/channels'
import {fetchFlip, submitFlip} from '../../services/api'
import {createFlip, createStoryFlip, flipDefs} from '../../services/flipper'
import styles from '../../styles/components/flips/flip-editor'
import {reorder} from '../../utils/arr'
import {FlipCrop} from './flip-crop'
import {FlipDisplay} from './flip-display'
import {FlipDrop} from './flip-drop'
import {getItemStyle, getListStyle} from './flip-editor.styles'
import Guard from './guard'
import {toHex} from '../../utils/req'
import {fromHexString} from '../../utils/string'

export class FlipEditor extends Component {
  state = {
    uploadedSrc: '',
    flipSizeExceeded: false,
    flip: createStoryFlip(),
    flipHash: '',
    fetchedFlip: [],
  }

  flipHashRef = React.createRef()

  componentDidMount() {
    global.ipcRenderer.on(channels.compressFlipSource, this.onCompress)
  }

  componentWillUnmount() {
    global.ipcRenderer.removeListener(
      channels.compressFlipSource,
      this.onCompress
    )
  }

  onCompress = (_ev, data) =>
    this.setState({
      uploadedSrc: URL.createObjectURL(new Blob([data], {type: 'image/jpeg'})),
    })

  handleUpload = ev => {
    ev.preventDefault()

    const file = (ev.target || ev.dataTransfer).files[0]

    Guard.type(file)

    const reader = new FileReader()
    reader.addEventListener('loadend', ev => {
      global.ipcRenderer.send(
        channels.compressFlipSource,
        new Int8Array(ev.target.result)
      )
    })
    reader.readAsArrayBuffer(file)
  }

  handleSubmitCrop = blob => {
    if (this.state.flipSizeExceeded) {
      return
    }

    this.setState(({flip: {pics, order: [correct, wrong]}}) => ({
      flip: createStoryFlip(pics.concat(blob), [
        correct.concat(correct.length),
        wrong.concat(wrong.length),
      ]),
      flipSizeExceeded: pics.length < flipDefs[0].pics.length,
    }))
  }

  handleDragEnd = idx => result => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const nextOrder = reorder(
      this.state.flip.order[idx],
      result.source.index,
      result.destination.index
    )

    this.setState(({flip}) => ({
      flip: {...flip, order: nextOrder},
    }))
  }

  handleSubmitFlip = async () => {
    const hexBuff = encode(this.state.flip)
    try {
      const {result} = await submitFlip(toHex(hexBuff))
      this.setState({
        flipHash: result.flipHash,
      })
    } catch {
      this.setState({
        flipHash: 'Maximum image size exceeded',
      })
    }
  }

  handleFetchFlip = async () => {
    const hash = this.flipHashText.value || this.state.flipHash
    const {result} = await fetchFlip(hash)

    const decodedBuff = decode(fromHexString(result.hex.substr(2)))
    const flipPics = decodedBuff.slice(0, 4)
    const flipOrder = decodedBuff.slice(4)

    const orderedFlipPics = []
    for (let i = 0; i < flipOrder.length; i++) {
      orderedFlipPics.push([])
      for (let k = 0; k < flipOrder[i].length; k++) {
        const uploadedSrc = flipPics[flipOrder[i][k][0] || 0]
        const origImageData = new ImageData(
          new Uint8ClampedArray(uploadedSrc),
          this.state.dims.w,
          this.state.dims.h
        )
        orderedFlipPics[i].push(origImageData)
      }
    }

    this.setState({
      fetchedFlip: orderedFlipPics,
    })
  }

  reset = () => {
    this.setState({
      uploadedSrc: '',
      flipSizeExceeded: false,
      flip: createStoryFlip(),
    })
  }

  render() {
    const {uploadedSrc, flip, fetchedFlip} = this.state
    return (
      <>
        <h2>FLIPs</h2>
        <div>
          Drag and drop your pics here or upload manually{' '}
          <input
            type="file"
            accept="image/*"
            onChange={this.handleUpload}
            disabled={this.state.flipSizeExceeded}
          />
          <div>
            <button onClick={this.reset}>Reset</button>
          </div>
        </div>
        {uploadedSrc && (
          <div>
            <FlipCrop
              src={uploadedSrc}
              disabled={this.state.flipSizeExceeded}
              onSubmit={this.handleSubmitCrop}
            />
            <h2>{flip.type}</h2>
            <h3>Reference pics</h3>
            {flip.pics.map(
              (pic, idx) =>
                pic && (
                  <img
                    key={`flip-pic-${idx}`}
                    src={URL.createObjectURL(
                      new Blob([pic], {type: 'image/jpeg'})
                    )}
                  />
                )
            )}
            <h3>Options</h3>
            <div className="row">
              {flip.order.map((order, orderIdx) => (
                <div key={`ord-${orderIdx}`}>
                  <DragDropContext onDragEnd={this.handleDragEnd(orderIdx)}>
                    <Droppable droppableId={`droppable-ord${orderIdx}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}
                        >
                          {order.map((refIdx, idx) => (
                            <Draggable
                              key={`flip-pic-draggable-${refIdx}-${orderIdx}`}
                              draggableId={`flip-pic-${refIdx}-${orderIdx}`}
                              index={idx}
                            >
                              {(provided, snapshot) =>
                                flip.pics[refIdx] && (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                    )}
                                  >
                                    <img
                                      key={`flip-${refIdx}-${orderIdx}`}
                                      src={URL.createObjectURL(
                                        new Blob([flip.pics[refIdx]], {
                                          type: 'image/jpeg',
                                        })
                                      )}
                                    />
                                  </div>
                                )
                              }
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              ))}
            </div>
            <button
              onClick={this.handleSubmitFlip}
              className="btn btn--primary"
            >
              Submit
            </button>
            <pre>{this.state.flipHash}</pre>
          </div>
        )}
        <h2>Fetched flips</h2>
        <input type="text" ref={this.flipHashRef} />
        <button onClick={this.handleFetchFlip} className="btn">
          Get Flip
        </button>
        <div className="row">
          {fetchedFlip.map((pics, i) => (
            <div key={`cf-${i}`}>
              {pics.map((pic, k) => (
                <FlipDisplay key={`df${i}${k}`} imageData={pic} />
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
          ${styles}
          .row {
            display: flex;
          }
          .row > div {
            width: 50%;
          }

          .btn {
            border: none;
            padding: 0.5em;
          }
          .btn--primary {
            background: blue;
            color: white;
            font-size: 1.6em;
            font-weight: 600;
          }
        `}</style>
      </>
    )
  }
}
