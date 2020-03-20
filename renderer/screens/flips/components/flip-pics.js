/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {useState, useEffect} from 'react'

import PropTypes from 'prop-types'
import {rem, position, borderRadius, margin} from 'polished'

import {FaImage} from 'react-icons/fa'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'
import mousetrap from 'mousetrap'
import {useTranslation} from 'react-i18next'
import {Box} from '../../../shared/components'

import Flex from '../../../shared/components/flex'
import FlipEditor from './flip-editor'
import theme from '../../../shared/theme'
import {convertToBase64Url} from '../utils/use-data-url'
import {getImageURLFromClipboard} from '../../../shared/utils/clipboard'

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

function FlipPics({id, pics, hint, onUpdateFlip}) {
  const {t} = useTranslation()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pickedUrl, setPickedUrl] = useState('')
  const [imageClipboard, setImageClipboard] = useState(null)

  const updatePic = (idx, url) => {
    if (url) {
      convertToBase64Url(url, base64Url => {
        onUpdateFlip([...pics.slice(0, idx), base64Url, ...pics.slice(idx + 1)])
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

  mousetrap.bind(['command+v', 'ctrl+v'], function() {
    pasteImageFromClipboard()
    return false
  })

  function pasteImageFromClipboard() {
    const url = getImageURLFromClipboard()
    if (url) {
      setImageClipboard(url)
    }
  }

  function onDragEnd(result) {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    setSelectedIndex(result.destination.index)

    const nextOrder = reorder(
      pics,
      result.source.index,
      result.destination.index
    )

    onUpdateFlip(nextOrder)
  }

  return (
    <Flex>
      <Box css={margin(0, rem(40), 0, 0)}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {pics.map((src, idx) => {
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
                      border: `solid 2px ${theme.colors.primary}`,
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
                    <Draggable key={idx} draggableId={`pic${idx}`} index={idx}>
                      {/* eslint-disable-next-line no-shadow */}
                      {provided => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedIndex(idx)}
                        >
                          <Image key={idx} src={src} style={style} />
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
        {pics.map((src, idx) => (
          <FlipEditor
            key={idx}
            idx={idx}
            visible={idx === selectedIndex}
            src={src}
            onChange={url => {
              updatePic(idx, url)
            }}
          />
        ))}
      </Box>
    </Flex>
  )
}

FlipPics.propTypes = {
  id: PropTypes.string,
  pics: PropTypes.arrayOf(PropTypes.string),
  hint: PropTypes.any,
  onUpdateFlip: PropTypes.func.isRequired,
}

// eslint-disable-next-line react/prop-types
function Image({src, style, children}) {
  if (src) {
    const imgBoxStyle = {
      ...{
        width: rem(149),
        height: rem(112),
        paddingLeft: '1px',
        paddingTop: '1px',
      },
    }
    const imgStyle = {...style, ...{width: rem(147), height: rem(110)}}
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
