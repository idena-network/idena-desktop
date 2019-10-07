/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useRef, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'
import {
  FiSearch,
  FiUpload,
  FiRefreshCw,
  FiImage,
  FiXCircle,
  FiChevronLeft,
  FiMove,
} from 'react-icons/fi'
import {
  rem,
  margin,
  position,
  backgrounds,
  padding,
  borderRadius,
} from 'polished'

import Flex from '../../../shared/components/flex'
import {Box, Absolute, Input} from '../../../shared/components'
import {shuffle} from '../../../shared/utils/arr'
import theme from '../../../shared/theme'
import {IconButton} from '../../../shared/components/button'
import ImageEditor from './image-editor'
import Divider from '../../../shared/components/divider'
import {IMAGE_SEARCH_PICK, IMAGE_SEARCH_TOGGLE} from '../../../../main/channels'
import {convertToBase64Url} from '../utils/use-data-url'
import {hasDataUrl} from '../utils/flip'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

function FlipShuffle({
  pics,
  order,
  nonSensePic,
  nonSenseOrder,
  onShuffleFlip,
  onUpdateNonSensePic,
}) {
  const [showAddNonsesneImage, setShowAddNonsenseImage] = React.useState(false)

  function onDragEnd(result) {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    const nextOrder = reorder(
      order,
      result.source.index,
      result.destination.index
    )

    onShuffleFlip(nextOrder)
  }

  if (showAddNonsesneImage) {
    return (
      <NonsenseImageEditor
        {...{
          pics,
          order,
          nonSensePic,
          nonSenseOrder,
          onUpdateNonSensePic,
          setShowAddNonsenseImage,
        }}
        onClose={() => {
          setShowAddNonsenseImage(false)
        }}
      />
    )
  }

  return (
    <Flex justify="center">
      <Flex direction="column" justify="center" align="center">
        {pics.map((src, k) => {
          let style = {...position('relative'), opacity: 0.5}

          if (k === 0) {
            style = {...style, ...borderRadius('top', rem(8))}
          }
          if (k === order.length - 1) {
            style = {...style, ...borderRadius('bottom', rem(8))}
          }

          return (
            <Box key={k}>
              <Image key={src} src={src} style={style} />
            </Box>
          )
        })}
      </Flex>
      <Box w="2em">&nbsp;</Box>
      <Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {order.map((idx, k) => {
                  let style = {...position('relative')}

                  if (k === 0) {
                    style = {...style, ...borderRadius('top', rem(8))}
                  }
                  if (k === order.length - 1) {
                    style = {...style, ...borderRadius('bottom', rem(8))}
                  }

                  return (
                    <Draggable key={idx} draggableId={`pic${idx}`} index={k}>
                      {/* eslint-disable-next-line no-shadow */}
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <Image
                            key={idx}
                            src={
                              idx === nonSenseOrder ? nonSensePic : pics[idx]
                            }
                            style={style}
                          >
                            <Movable />
                          </Image>
                        </div>
                      )}
                    </Draggable>
                  )
                })}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
      <Box>
        <Box css={{position: 'absolute', top: '50%', margin: '10px'}}>
          <ShuffleButton
            css={{margin: 0}}
            onClick={() => {
              const nextOrder = [...shuffle(order)]
              onShuffleFlip(nextOrder)
            }}
          />
          {nonSenseOrder < 0 && (
            <AddImageButton
              css={{margin: 0}}
              onClick={() => {
                setShowAddNonsenseImage(true)
              }}
            />
          )}

          {nonSenseOrder >= 0 && (
            <DeleteImageButton
              css={{margin: 0}}
              onClick={() => {
                onUpdateNonSensePic('https://placehold.it/480?text=5', -1)
              }}
            />
          )}
        </Box>
      </Box>
    </Flex>
  )
}

FlipShuffle.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  order: PropTypes.arrayOf(PropTypes.number),
  nonSensePic: PropTypes.string,
  nonSenseOrder: PropTypes.number,
  onShuffleFlip: PropTypes.func.isRequired,
  onUpdateNonSensePic: PropTypes.func.isRequired,
}

// eslint-disable-next-line react/prop-types
function Image({src, style, children}) {
  return (
    <Box style={style}>
      <img alt="flip" width={120} src={src} />
      {children}
    </Box>
  )
}

function ShuffleButton(props) {
  return (
    <IconButton icon={<FiRefreshCw />} {...props}>
      Shuffle
    </IconButton>
  )
}

function AddImageButton(props) {
  return (
    <IconButton icon={<FiImage />} {...props}>
      Add alternative image
    </IconButton>
  )
}

function DeleteImageButton(props) {
  return (
    <IconButton style={{color: 'red'}} icon={<FiXCircle />} {...props}>
      Remove alternative image
    </IconButton>
  )
}

function Movable(props) {
  return (
    <Absolute
      top={rem(4)}
      right={rem(4)}
      css={{
        ...backgrounds(theme.colors.primary2),
        ...padding(rem(theme.spacings.small8)),
        ...borderRadius('top', rem(6)),
        ...borderRadius('bottom', rem(6)),
        opacity: 0.8,
      }}
      {...props}
    >
      <FiMove color={theme.colors.white} />
    </Absolute>
  )
}

function NonsenseImageEditor({
  pics,
  order,
  nonSensePic,
  nonSenseOrder,
  onUpdateNonSensePic,
  setShowAddNonsenseImage,
}) {
  const [selectedIndex, setSelectedIndex] = useState(
    nonSenseOrder < 0 ? order[0] : nonSenseOrder
  )

  const nonsenseImageUploaderRef = useRef()

  const [pickedUrl, setPickedUrl] = useState('')

  const handleImageSearchPick = (_, data) => {
    const [{url}] = data.docs[0].thumbnails
    setPickedUrl(url)
  }

  useEffect(() => {
    global.ipcRenderer.on(IMAGE_SEARCH_PICK, handleImageSearchPick)
    return () => {
      global.ipcRenderer.removeListener(
        IMAGE_SEARCH_PICK,
        handleImageSearchPick
      )
    }
  }, [])

  useEffect(() => {
    if (pickedUrl) {
      convertToBase64Url(pickedUrl, base64Url => {
        onUpdateNonSensePic(base64Url, selectedIndex)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUrl, selectedIndex])

  const handleUpload = e => {
    e.preventDefault()

    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image')) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      onUpdateNonSensePic(re.target.result, selectedIndex)
    })
    reader.readAsDataURL(file)
  }

  return (
    <Flex>
      <div
        style={{
          ...margin(rem(-92.5), 0, 0, rem(-56)),
        }}
      >
        <IconButton
          tooltip=""
          icon={<FiChevronLeft fontSize={rem(25)} color={theme.colors.muted} />}
          onClick={() => {
            setShowAddNonsenseImage(false)
          }}
        />
      </div>

      <Box>
        <Flex justify="left">
          <Flex direction="column" justify="left" align="left">
            {pics.map((src, k) => {
              let style = {...position('relative'), opacity: 0.5}

              if (k === 0) {
                style = {...style, ...borderRadius('top', rem(8))}
              }
              if (k === pics.length - 1) {
                style = {...style, ...borderRadius('bottom', rem(8))}
              }

              return (
                // eslint-disable-next-line react/no-array-index-key
                <Box key={k}>
                  <img alt={`flip-${k}`} width={120} src={src} style={style} />
                </Box>
              )
            })}
          </Flex>
          <Box w="2em">&nbsp;</Box>
          <Flex direction="column" justify="left" align="left">
            {order.map((idx, k) => {
              const isCurrent = idx === selectedIndex

              let style = position('relative')

              if (k === 0) {
                style = {...style, ...borderRadius('top', rem(8))}
              }
              if (k === order.length - 1) {
                style = {...style, ...borderRadius('bottom', rem(8))}
              }

              if (isCurrent) {
                style = {
                  ...style,
                  border: `solid 2px ${theme.colors.primary}`,
                  boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
                }
              }

              return (
                <Box key={idx}>
                  <div
                    onClick={() => {
                      setSelectedIndex(idx)
                      if (hasDataUrl(nonSensePic)) {
                        onUpdateNonSensePic(nonSensePic, idx)
                      }
                    }}
                  >
                    <img
                      alt={`flip-${idx}`}
                      width={120}
                      src={isCurrent ? nonSensePic : pics[idx]}
                      style={style}
                    />
                  </div>
                </Box>
              )
            })}
          </Flex>
        </Flex>
      </Box>
      <Box w="2em">&nbsp;</Box>
      <Box>
        <ImageEditor src={nonSensePic} />
        <Flex
          justify="space-between"
          align="center"
          css={margin(rem(theme.spacings.medium16), 0, 0)}
        >
          <IconButton
            icon={<FiSearch />}
            onClick={() => {
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, 1)
            }}
          >
            Search on Google
          </IconButton>
          <Divider vertical />

          <IconButton
            tooltip=""
            icon={<FiUpload />}
            onClick={() => {
              nonsenseImageUploaderRef.current.click()
            }}
          >
            Select file
            <small> (150kb) </small>
          </IconButton>

          <Box>
            <Input
              ref={nonsenseImageUploaderRef}
              type="file"
              accept="image/*"
              style={{
                display: 'none',
                border: 'none',
                paddingRight: 0,
                width: rem(230),
              }}
              onChange={handleUpload}
            />
          </Box>
        </Flex>
      </Box>
    </Flex>
  )
}

NonsenseImageEditor.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  order: PropTypes.arrayOf(PropTypes.number),
  nonSensePic: PropTypes.string,
  nonSenseOrder: PropTypes.number,
  onUpdateNonSensePic: PropTypes.func.isRequired,
  setShowAddNonsenseImage: PropTypes.func.isRequired,
}

export default FlipShuffle
