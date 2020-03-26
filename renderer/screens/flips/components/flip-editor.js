import React, {createRef, useRef, useCallback, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {rem, position} from 'polished'
import {FaGoogle, FaPaste, FaRegFolder} from 'react-icons/fa'
import {MdAddToPhotos, MdCrop} from 'react-icons/md'

import {useTranslation} from 'react-i18next'
import mousetrap from 'mousetrap'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Menu, MenuItem} from '../../../shared/components/menu'

import {useInterval} from '../../../shared/hooks/use-interval'
import {IconButton} from '../../../shared/components/button'
import {Box, Absolute, Input} from '../../../shared/components'
import Divider from '../../../shared/components/divider'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {resizing, imageResize} from '../../../shared/utils/img'
import {getImageURLFromClipboard} from '../../../shared/utils/clipboard'

import {IMAGE_SEARCH_PICK, IMAGE_SEARCH_TOGGLE} from '../../../../main/channels'

const ImageEditor =
  typeof window !== 'undefined'
    ? require('@toast-ui/react-image-editor').default
    : null

const BOTTOM_MENU_MAIN = 0
const BOTTOM_MENU_CROP = 1

const IMAGE_WIDTH = 440
const IMAGE_HEIGHT = 330
const INSERT_OBJECT_IMAGE = 1
const INSERT_BACKGROUND_IMAGE = 2
const BLANK_IMAGE_DATAURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQYlWP4//8/AAX+Av5e8BQ1AAAAAElFTkSuQmCC'
const BLANK_IMAGE =
  global.nativeImage &&
  global.nativeImage
    .createFromDataURL(BLANK_IMAGE_DATAURL)
    .resize({width: IMAGE_WIDTH, height: IMAGE_HEIGHT})
    .toDataURL()

function FlipEditor({idx = 0, src, visible, onChange}) {
  const {t} = useTranslation()

  // Button menu
  const [isInsertImageMenuOpen, setInsertImageMenuOpen] = useState(false)
  const insertMenuRef = [useRef(), useRef(), useRef(), useRef()]

  useClickOutside(insertMenuRef[idx], () => {
    setInsertImageMenuOpen(false)
  })

  const [bottomMenuPanel, setBottomMenuPanel] = useState(BOTTOM_MENU_MAIN)

  // Editors
  const editorRefs = useRef([
    createRef(),
    createRef(),
    createRef(),
    createRef(),
  ])
  const uploaderRef = useRef()
  const [editors, setEditors] = useState([null, null, null, null])
  const setEditor = (k, e) => {
    if (e) {
      setEditors([...editors.slice(0, k), e, ...editors.slice(k + 1)])
    }
  }

  // Postponed onChange() triggering
  const NOCHANGES = 0
  const NEWCHANGES = 1
  const [changesCnt, setChangesCnt] = useState(NOCHANGES)
  const handleOnChanging = useCallback(() => {
    if (changesCnt === -1) return
    if (!changesCnt) setChangesCnt(1)
  }, [changesCnt])
  useInterval(() => {
    if (changesCnt >= NEWCHANGES) setChangesCnt(changesCnt + 1)
    if (changesCnt >= 3) {
      setChangesCnt(NOCHANGES)
      const url = editors[idx].toDataURL()
      onChange(url)
    }
  }, 50)

  const [insertImageMode, setInsertImageMode] = useState(0)

  const setImageUrl = useCallback(
    data => {
      const {url, insertMode, customEditor} = data
      const editor = customEditor || editors[idx]

      if (!url || !editor) return
      const nextInsertMode = insertMode || insertImageMode

      if (nextInsertMode === INSERT_OBJECT_IMAGE) {
        editor.addImageObject(url).then(handleOnChanging())
      }

      if (nextInsertMode === INSERT_BACKGROUND_IMAGE) {
        editor.loadImageFromURL(BLANK_IMAGE, 'blank').then(() => {
          editor.addImageObject(url).then(objectProps => {
            const {id} = objectProps
            const {width, height} = editor.getObjectProperties(id, [
              'left',
              'top',
              'width',
              'height',
            ])
            const {newWidth, newHeight} = resizing(
              width,
              height,
              IMAGE_WIDTH,
              IMAGE_HEIGHT,
              false
            )
            editor.setObjectPropertiesQuietly(id, {
              left: IMAGE_WIDTH / 2 + Math.random() * 200 - 400,
              top: IMAGE_HEIGHT / 2 + Math.random() * 200 - 400,
              width: newWidth * 10,
              height: newHeight * 10,
              opacity: 0.5,
            })
            editor.loadImageFromURL(editor.toDataURL(), 'BlurBkgd').then(() => {
              editor.addImageObject(url).then(objectProps2 => {
                const {id: id2} = objectProps2

                editor.setObjectPropertiesQuietly(id2, {
                  left: IMAGE_WIDTH / 2,
                  top: IMAGE_HEIGHT / 2,
                  width: newWidth,
                  height: newHeight,
                })
                editor
                  .loadImageFromURL(editor.toDataURL(), 'Bkgd')
                  .then(handleOnChanging())
              })
            })
          })
        })
      }
    },
    [editors, handleOnChanging, idx, insertImageMode]
  )

  // File upload handling
  const handleUpload = e => {
    e.preventDefault()
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image')) {
      return
    }
    const reader = new FileReader()
    reader.addEventListener('loadend', re => {
      const img = global.nativeImage.createFromDataURL(re.target.result)
      const url = imageResize(img, IMAGE_WIDTH, IMAGE_HEIGHT)
      setImageUrl({url})
      setInsertImageMode(0)
    })
    reader.readAsDataURL(file)
  }

  // Google search handling
  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const handleImageSearchPick = (_, data) => {
      const [{url}] = data.docs[0].thumbnails
      setImageUrl({url})
      setInsertImageMode(0)
    }

    global.ipcRenderer.on(IMAGE_SEARCH_PICK, handleImageSearchPick)
    return () => {
      global.ipcRenderer.removeListener(
        IMAGE_SEARCH_PICK,
        handleImageSearchPick
      )
    }
  }, [setImageUrl, insertImageMode])

  // Clipbiard handling
  const handleImageFromClipboard = insertMode => {
    const url = getImageURLFromClipboard(IMAGE_WIDTH, IMAGE_HEIGHT)
    if (url) {
      setImageUrl({url, insertMode})
    }
  }

  mousetrap.bind(['command+v', 'ctrl+v'], function() {
    // handleImageFromClipboard(INSERT_BACKGROUND_IMAGE)
    return false
  })

  // init editor
  useEffect(() => {
    const updateEvents = e => {
      e.on({
        objectMoved() {
          handleOnChanging()
        },
      })
      e.on({
        objectRotated() {
          handleOnChanging()
        },
      })
      e.on({
        objectScaled() {
          handleOnChanging()
        },
      })
      e.on({
        redoStackChanged() {
          handleOnChanging()
        },
      })
      e.on({
        undoStackChanged() {
          handleOnChanging()
        },
      })
      e.on({
        objectActivated() {
          handleOnChanging()
        },
      })
    }

    const contaiterEl = document.querySelectorAll(
      '.tui-image-editor-canvas-container'
    )[idx]
    const contaiterCanvas = document.querySelectorAll('.lower-canvas')[idx]

    if (contaiterEl) contaiterEl.parentElement.style.height = '330px'
    if (contaiterCanvas) contaiterCanvas.style.borderRadius = rem(12)

    const newEditor =
      editorRefs.current[idx] &&
      editorRefs.current[idx].current &&
      editorRefs.current[idx].current.getInstance()

    if (newEditor) {
      if (!editors[idx]) {
        setEditor(idx, newEditor)
        if (src) {
          newEditor.loadImageFromURL(src, 'src').then(() => {
            updateEvents(newEditor)
          })
        } else {
          newEditor.loadImageFromURL(BLANK_IMAGE, 'blank').then(() => {
            updateEvents(newEditor)
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRefs, src, idx])

  return (
    <Box
      style={{
        display: `${visible ? '' : 'none'}`,
      }}
    >
      <div
        style={{
          paddingTop: '0.5px',
          paddingLeft: '0.5px',
          width: '442px',
          height: '333px',
          border: 'solid 1px rgba(83, 86, 92, 0.16)',
          borderRadius: rem(12),
        }}
      >
        <ImageEditor
          key={idx}
          ref={editorRefs.current[idx]}
          cssMaxHeight={IMAGE_HEIGHT}
          cssMaxWidth={IMAGE_WIDTH}
          selectionStyle={{
            cornerSize: 20,
            rotatingPointOffset: 70,
          }}
          usageStatistics={false}
        />
      </div>

      {bottomMenuPanel === BOTTOM_MENU_MAIN && (
        <Flex
          // justify="space-between"
          align="center"
          css={{marginTop: rem(10)}}
        >
          <IconButton
            tooltip={t('Search on Google')}
            icon={
              <FaGoogle
                color={theme.colors.primary2}
                fontSize={theme.fontSizes.medium16}
              />
            }
            onClick={() => {
              setInsertImageMode(INSERT_BACKGROUND_IMAGE)
              global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, {
                on: true,
                id: `google-search-img`,
              })
            }}
          ></IconButton>

          <IconButton
            tooltip={t('Select file')}
            icon={
              <FaRegFolder color={theme.colors.primary2} fontSize={rem(20)} />
            }
            onClick={() => {
              setInsertImageMode(INSERT_BACKGROUND_IMAGE)
              uploaderRef.current.click()
            }}
          ></IconButton>

          <IconButton
            tooltip={t('Paste image')}
            icon={<FaPaste color={theme.colors.primary2} fontSize={rem(20)} />}
            onClick={() => {
              handleImageFromClipboard(INSERT_BACKGROUND_IMAGE)
            }}
          ></IconButton>

          <Divider vertical />

          <IconButton
            tooltip={t('Add image')}
            icon={
              <MdAddToPhotos
                color={theme.colors.primary2}
                fontSize={theme.fontSizes.large}
              />
            }
            onClick={() => {
              setInsertImageMenuOpen(!isInsertImageMenuOpen)
            }}
          ></IconButton>

          <Divider vertical />

          <IconButton
            disabled={src === null}
            tooltip={t('Crop image')}
            icon={
              <MdCrop
                color={theme.colors.primary2}
                fontSize={theme.fontSizes.large}
              />
            }
            onClick={() => {
              editors[idx].startDrawingMode('CROPPER')
              setBottomMenuPanel(BOTTOM_MENU_CROP)
            }}
          ></IconButton>

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
      )}

      {bottomMenuPanel === BOTTOM_MENU_CROP && (
        <Flex
          justify="space-between"
          align="center"
          css={{
            marginTop: rem(10),
            paddingLeft: rem(20),
            paddingRight: rem(20),
          }}
        >
          {t('Corp image')}
          <Flex align="center">
            <IconButton
              onClick={() => {
                setBottomMenuPanel(BOTTOM_MENU_MAIN)
                if (editors[idx]) {
                  editors[idx].stopDrawingMode()
                }
              }}
            >
              {t('Cancel')}
            </IconButton>

            <Divider vertical />

            <IconButton
              style={{fontWeight: theme.fontWeights.bold}}
              onClick={() => {
                setBottomMenuPanel(BOTTOM_MENU_MAIN)
                if (editors[idx]) {
                  console.log(editors[idx].getCropzoneRect())
                  const {width, height} = editors[idx].getCropzoneRect()
                  if (width < 1 || height < 1) {
                    editors[idx].stopDrawingMode()
                  } else {
                    editors[idx]
                      .crop(editors[idx].getCropzoneRect())
                      .then(() => {
                        editors[idx].stopDrawingMode()
                        setImageUrl({
                          url: editors[idx].toDataURL(),
                          insertMode: INSERT_BACKGROUND_IMAGE,
                          customEditor: editors[idx],
                        })
                      })
                  }
                }
              }}
            >
              {t('Done')}
            </IconButton>
          </Flex>
        </Flex>
      )}
      <Box>
        <Flex>
          <Box css={position('relative')}>
            {isInsertImageMenuOpen && (
              <Box ref={insertMenuRef[idx]}>
                <Absolute top="-11.4em" right="-17em" zIndex={100}>
                  <Menu>
                    <MenuItem
                      onClick={async () => {
                        setInsertImageMenuOpen(false)
                        setInsertImageMode(INSERT_OBJECT_IMAGE)
                        global.ipcRenderer.send(IMAGE_SEARCH_TOGGLE, {
                          on: true,
                          id: `google-search-img`,
                        })
                      }}
                      disabled={false}
                      icon={
                        <FaGoogle
                          fontSize={theme.fontSizes.medium16}
                          style={{marginTop: rem(3)}}
                        />
                      }
                    >
                      {t('Search on Google')}
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        setInsertImageMenuOpen(false)
                        setInsertImageMode(INSERT_OBJECT_IMAGE)
                        uploaderRef.current.click()
                      }}
                      disabled={false}
                      icon={<FaRegFolder fontSize={rem(20)} />}
                    >
                      {t('Select file')}
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        setInsertImageMenuOpen(false)
                        handleImageFromClipboard(INSERT_OBJECT_IMAGE)
                      }}
                      disabled={false}
                      danger={false}
                      icon={<FaPaste fontSize={rem(20)} />}
                    >
                      {t('Paste image')}
                    </MenuItem>
                  </Menu>
                </Absolute>
              </Box>
            )}
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}

FlipEditor.propTypes = {
  idx: PropTypes.number,
  src: PropTypes.string,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
}

export default FlipEditor
