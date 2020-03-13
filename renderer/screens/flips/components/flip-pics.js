/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {useRef, useState, useEffect} from 'react'

import PropTypes from 'prop-types'
import {rem, position, borderRadius, margin} from 'polished'
import {FiSearch, FiUpload, FiCopy} from 'react-icons/fi'
import {Draggable, DragDropContext, Droppable} from 'react-beautiful-dnd'
import mousetrap from 'mousetrap'
import {useTranslation} from 'react-i18next'
import {Box, Input} from '../../../shared/components'
import Divider from '../../../shared/components/divider'
import Flex from '../../../shared/components/flex'
import FlipEditor from './flip-editor'
import theme from '../../../shared/theme'
import {convertToBase64Url} from '../utils/use-data-url'
import {IMAGE_SEARCH_PICK, IMAGE_SEARCH_TOGGLE} from '../../../../main/channels'
import {IconButton} from '../../../shared/components/button'
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

  const handleUpload = e => {
    e.preventDefault()

    const file = e.target.files[0]

    if (!file || !file.type.startsWith('image')) {
      return
    }

    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      onUpdateFlip([
        ...pics.slice(0, selectedIndex),
        re.target.result,
        ...pics.slice(selectedIndex + 1),
      ])
    })
    reader.readAsDataURL(file)
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

  const uploaderRef = useRef()

  return (
    <Flex>
      <Box css={margin(0, rem(40), 0)}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="flip">
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {pics.map((src, idx) => {
                  const isCurrent = idx === selectedIndex

                  let style = position('relative')

                  if (idx === 0) {
                    style = {...style, ...borderRadius('top', rem(8))}
                  }
                  if (idx === pics.length - 1) {
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
        <FlipEditor src={pics[selectedIndex]} />
        <Flex
          justify="space-between"
          align="center"
          css={margin(rem(theme.spacings.medium16), 0, 0)}
        >
          <IconButton
            icon={<FiSearch />}
            onClick={() =>
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, {
                on: true,
                id: `${id}-${hint.words.map(({name}) => name).join('-')}`,
              })
            }
          >
            {t('Search on Google')}
          </IconButton>
          <Divider vertical />

          <IconButton
            tooltip=""
            icon={<FiUpload />}
            onClick={() => {
              uploaderRef.current.click()
            }}
          >
            {t('Select file')}
            <small> (150kb) </small>
          </IconButton>

          <Divider vertical />

          <IconButton
            tooltip=""
            icon={<FiCopy />}
            onClick={() => pasteImageFromClipboard()}
          >
            {t('Paste image')} ({global.isMac ? 'Cmd' : 'Ctrl'}+V)
          </IconButton>

          <Box>
            <Input
              ref={uploaderRef}
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

FlipPics.propTypes = {
  id: PropTypes.string,
  pics: PropTypes.arrayOf(PropTypes.string),
  hint: PropTypes.any,
  onUpdateFlip: PropTypes.func.isRequired,
}

// eslint-disable-next-line react/prop-types
function Image({src, style, children}) {
  return (
    <Box>
      <img alt="flip" width={120} src={src} style={style} />
      {children}
    </Box>
  )
}

export default FlipPics
