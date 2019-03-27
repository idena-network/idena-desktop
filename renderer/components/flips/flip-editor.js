/* eslint-disable react/no-array-index-key */
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import {decode, encode} from 'rlp'
import channels from '../../../main/channels'
import {fetchFlip, submitFlip} from '../../services/api'
import {createStoryFlip, flipDefs} from '../../services/flipper'
import {reorder, shuffle} from '../../utils/arr'
import {FlipCrop} from './flip-crop'
import {getItemStyle, getListStyle} from './flip-editor.styles'
import guard from './guard'
import {toHex} from '../../utils/req'
import {fromHexString} from '../../utils/string'
import {flipsStorageKey} from '../../providers/flip-provider'

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
    global.ipcRenderer.removeListener(channels.compressFlipSource, this.onCompress)
  }

  onCompress = (_ev, data) =>
    this.setState({
      uploadedSrc: URL.createObjectURL(new Blob([data], {type: 'image/jpeg'})),
    })

  handleUpload = ev => {
    ev.preventDefault()

    const file = (ev.target || ev.dataTransfer).files[0]

    guard.type(file)

    const reader = new FileReader()
    reader.addEventListener('loadend', readerEvent => {
      global.ipcRenderer.send(channels.compressFlipSource, new Uint8Array(readerEvent.target.result))
    })
    reader.readAsArrayBuffer(file)
  }

  handleSubmitCrop = blob => {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.flipSizeExceeded) {
      return
    }

    this.setState(({flip: {pics, order: [correct, wrong]}}) => {
      const nextPics = pics.concat(blob)
      const nextOrder = [correct.concat(correct.length), wrong.concat(wrong.length)]
      return {
        flip: createStoryFlip(nextPics, nextOrder),
        flipSizeExceeded: nextPics.length > flipDefs[0].pics.length - 1,
      }
    })
  }

  handleDragEnd = idx => result => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const {
      flip: {pics, order},
    } = this.state

    order[idx] = reorder(order[idx], result.source.index, result.destination.index)

    this.setState({
      flip: createStoryFlip(pics, order),
    })
  }

  handleSubmitFlip = async () => {
    const {
      flips: {pics, order},
    } = this.state

    const promises = pics.map(blob => new Response(blob).arrayBuffer())
    const arrayBuffers = await Promise.all(promises)

    const hexBuff = encode([arrayBuffers.map(ab => new Uint8Array(ab)), order])
    try {
      const resp = await submitFlip(toHex(hexBuff))
      if (resp.ok) {
        const {result, error} = await resp.json()
        this.setState({
          flipHash: (result && result.flipHash) || error.message,
        })
        try {
          const storedFlips = JSON.parse(localStorage.getItem(flipsStorageKey)) || []
          localStorage.setItem(flipsStorageKey, JSON.stringify([result.flipHash, ...storedFlips]))
        } catch (storageError) {
          // eslint-disable-next-line no-console
          console.error(storageError)
        }
      } else {
        this.setState({
          flipHash: resp.status === 413 ? 'Maximum image size exceeded' : 'Unexpected error occurred',
        })
      }
    } catch (err) {
      this.setState({
        flipHash: err.message,
      })
    }
  }

  handleFetchFlip = async () => {
    const {flipHash: hash = this.flipHashRef.current.value} = this.state
    const {result} = await fetchFlip(hash)

    const [flipPics, flipOrder] = decode(fromHexString(result.hex.substr(2)))

    const orderedFlipPics = []
    for (let i = 0; i < flipOrder.length; i += 1) {
      orderedFlipPics.push([])
      for (let k = 0; k < flipOrder[i].length; k += 1) {
        const picArrayBuffer = flipPics[flipOrder[i][k][0] || 0]
        orderedFlipPics[i].push(picArrayBuffer)
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

  handleClickShuffle = () => {
    const {
      flip: {
        pics,
        order: [firstOrder, lastOrder],
      },
    } = this.state

    this.setState({
      flip: createStoryFlip(pics, [firstOrder, shuffle(lastOrder)]),
    })
  }

  render() {
    const {uploadedSrc, flip, fetchedFlip, flipSizeExceeded, flipHash} = this.state
    return (
      <>
        <h2>FLIPs</h2>
        <div>
          Drag and drop your pics here or upload manually{' '}
          <input type="file" accept="image/*" onChange={this.handleUpload} disabled={flipSizeExceeded} />
          <div>
            <button type="button" onClick={this.reset}>
              Reset
            </button>
          </div>
        </div>
        {uploadedSrc && (
          <div>
            <FlipCrop src={uploadedSrc} disabled={flipSizeExceeded} onSubmit={this.handleSubmitCrop} />
            <h2>{flip.type}</h2>
            <h3>Reference pics</h3>
            {flip.pics.map(
              (pic, idx) =>
                pic && (
                  <img
                    key={`flip-pic-${idx}`}
                    alt={`flip-pic-${idx}`}
                    src={URL.createObjectURL(new Blob([pic], {type: 'image/jpeg'}))}
                  />
                )
            )}
            <h3>Options</h3>
            <div className="row">
              {flip.order.map((currOrder, orderIdx) => (
                <div key={`ord-${orderIdx}`}>
                  <DragDropContext onDragEnd={this.handleDragEnd(orderIdx)}>
                    <Droppable droppableId={`droppable-ord${orderIdx}`}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                          {currOrder.map((refIdx, idx) => (
                            <Draggable
                              key={`flip-pic-draggable-${refIdx}-${orderIdx}`}
                              draggableId={`flip-pic-${refIdx}-${orderIdx}`}
                              index={idx}
                            >
                              {(providedInner, snapshotInner) => (
                                <div
                                  ref={providedInner.innerRef}
                                  {...providedInner.draggableProps}
                                  {...providedInner.dragHandleProps}
                                  style={getItemStyle(snapshotInner.isDragging, providedInner.draggableProps.style)}
                                >
                                  <img
                                    key={`flip-${refIdx}-${orderIdx}`}
                                    alt={`flip-${refIdx}-${orderIdx}`}
                                    src={URL.createObjectURL(
                                      new Blob([flip.pics[refIdx]], {
                                        type: 'image/jpeg',
                                      })
                                    )}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {orderIdx === 1 && (
                            <button type="button" onClick={this.handleClickShuffle}>
                              Shuffle
                            </button>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              ))}
            </div>
            <button type="button" onClick={this.handleSubmitFlip} className="btn btn--primary">
              Submit
            </button>
            <pre>{flipHash}</pre>
          </div>
        )}
        <h2>Fetched flips</h2>
        <input type="text" ref={this.flipHashRef} />
        <button type="button" onClick={this.handleFetchFlip} className="btn">
          Get Flip
        </button>
        <div className="row">
          {fetchedFlip.map((pics, i) => (
            <div key={`cf-${i}`}>
              {pics.map((picSrc, k) => (
                <img
                  key={`df${i}${k}`}
                  alt={`df${i}${k}`}
                  width={200}
                  src={URL.createObjectURL(new Blob([picSrc], {type: 'image/jpeg'}))}
                />
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
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

export default FlipEditor
