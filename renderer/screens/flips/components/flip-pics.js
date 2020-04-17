/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {useState, useEffect, useCallback} from 'react'

import PropTypes from 'prop-types'
import {rem, borderRadius, margin} from 'polished'

import {FaImage} from 'react-icons/fa'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'

import Jimp from 'jimp'
import {Box} from '../../../shared/components'

import Flex from '../../../shared/components/flex'
import FlipEditor from './flip-editor'
import theme from '../../../shared/theme'
import {convertToBase64Url} from '../utils/use-data-url'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

function FlipPics({
  pics,
  compressedPics,
  editorIndexes,
  onUpdateFlip,
  onChanging,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickedUrl, setPickedUrl] = useState('')
  const [imageClipboard, setImageClipboard] = useState(null)

  const [isChanging, setIsChanging] = useState(-1)

  const updatePic = (idx, url) => {
    const editorIndex = editorIndexes.indexOf(idx)

    if (!url) {
      onUpdateFlip(
        [...pics.slice(0, editorIndex), null, ...pics.slice(editorIndex + 1)],
        [
          ...compressedPics.slice(0, editorIndex),
          null,
          ...compressedPics.slice(editorIndex + 1),
        ],
        editorIndexes
      )
      setIsChanging(-1)
    } else {
      Jimp.read(url).then(image => {
        image
          .resize(240, 180)
          .quality(60) // jpeg quality
          .getBase64Async('image/jpeg')
          .then(compressedUrl => {
            onUpdateFlip(
              [
                ...pics.slice(0, editorIndex),
                url,
                ...pics.slice(editorIndex + 1),
              ],
              [
                ...compressedPics.slice(0, editorIndex),
                compressedUrl,
                ...compressedPics.slice(editorIndex + 1),
              ],
              editorIndexes
            )
            setIsChanging(-1)
          })
      })
    }
  }

  useEffect(() => {
    if (pickedUrl) {
      convertToBase64Url(pickedUrl, base64Url => {
        onUpdateFlip([
          ...pics.slice(0, selectedIndex),
          base64Url,
          ...pics.slice(selectedIndex + 1),
        ])
        setPickedUrl(null)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUrl, selectedIndex])

  useEffect(() => {
    if (imageClipboard) {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        imageClipboard,
        ...pics.slice(selectedIndex + 1),
      ])
      setImageClipboard(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageClipboard, selectedIndex])

  function onDragEnd(result) {
    if (!result.destination) {
      return
    }
    if (result.destination.index === result.source.index) {
      return
    }
    setSelectedIndex(result.destination.index)

    const nextPics = reorder(
      pics,
      result.source.index,
      result.destination.index
    )

    const nextCompressedPics = reorder(
      compressedPics,
      result.source.index,
      result.destination.index
    )
    const nextEditorIndexes = reorder(
      editorIndexes,
      result.source.index,
      result.destination.index
    )
    onUpdateFlip(nextPics, nextCompressedPics, nextEditorIndexes)
  }

  return (
    <Flex>
      <Box css={margin(0, rem(40), 0, 0)}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {compressedPics &&
                  compressedPics.map((src, idx) => {
                    const isCurrent = idx === selectedIndex

                    let style = {
                      position: 'relative',
                    }

                    if (idx === 0) {
                      style = {
                        ...style,
                        ...borderRadius('top', rem(8)),
                      }
                    }
                    if (idx === pics.length - 1) {
                      style = {
                        ...style,
                        ...borderRadius('bottom', rem(8)),
                        borderBottom: 'solid 1px rgba(83, 86, 92, 0.16)',
                      }
                    }

                    if (isCurrent) {
                      style = {
                        ...style,
                        borderBottom: `solid 2px ${theme.colors.primary}`,
                        borderTop: `solid 2px ${theme.colors.primary}`,
                        borderLeft: `solid 2px ${theme.colors.primary}`,
                        borderRight: `solid 2px ${theme.colors.primary}`,
                        boxShadow: '0 0 4px 4px rgba(87, 143, 255, 0.25)',
                      }
                    } else {
                      style = {
                        ...style,
                        borderTop: 'solid 1px rgba(83, 86, 92, 0.16)',
                        borderRight: 'solid 1px rgba(83, 86, 92, 0.16)',
                        borderLeft: 'solid 1px rgba(83, 86, 92, 0.16)',
                      }
                    }

                    return (
                      <Draggable
                        key={idx}
                        draggableId={`pic${idx}`}
                        index={idx}
                      >
                        {/* eslint-disable-next-line no-shadow */}
                        {provided => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setSelectedIndex(idx)
                            }}
                          >
                            <Image
                              key={idx}
                              disabled={isChanging === editorIndexes[idx]}
                              src={src}
                              style={style}
                            />
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
        {editorIndexes &&
          pics.map((src, idx) => (
            <FlipEditor
              key={editorIndexes[idx]}
              idx={editorIndexes[idx]}
              visible={editorIndexes[idx] === editorIndexes[selectedIndex]}
              src={src}
              onChange={url => {
                updatePic(editorIndexes[idx], url)
              }}
              onChanging={() => {
                setIsChanging(idx)
                onChanging()
              }}
            />
          ))}
      </Box>
    </Flex>
  )
}

FlipPics.propTypes = {
  pics: PropTypes.arrayOf(PropTypes.string),
  compressedPics: PropTypes.arrayOf(PropTypes.string),
  editorIndexes: PropTypes.arrayOf(PropTypes.number),
  hint: PropTypes.any,
  onUpdateFlip: PropTypes.func.isRequired,
  onChanging: PropTypes.func.isRequired,
}

// eslint-disable-next-line react/prop-types
function Image({src, disabled, style, children}) {
  if (src) {
    const imgBoxStyle = {
      ...{
        width: rem(149),
        height: rem(112),
        paddingLeft: '1px',
        paddingTop: '1px',
      },
    }
    const imgStyle = {
      ...style,
      ...{width: rem(147), height: rem(110), opacity: `${disabled ? 0.5 : 1}`},
    }
    return (
      <Box style={imgBoxStyle}>
        <img alt="flip" src={src} style={imgStyle} />
        {children}
      </Box>
    )
  }

  const boxStyle = {
    ...style,
    ...{
      backgroundColor: '#f5f6f7',
      width: rem(149),
      height: rem(112),
    },
  }
  return (
    <Box style={boxStyle}>
      <FaImage
        style={{
          fontSize: rem(40),
          color: '#d2d4d9',
          marginTop: rem(35),
          marginLeft: rem(55),
        }}
      ></FaImage>
      {children}
    </Box>
  )
}

export default FlipPics
