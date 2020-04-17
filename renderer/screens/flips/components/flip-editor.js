import React, {createRef, useRef, useCallback, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {rem, position, wordWrap} from 'polished'
import {
  FaGoogle,
  FaCircle,
  FaCopy,
  FaPaste,
  FaRegFolder,
  FaPencilAlt,
  FaRegTrashAlt,
} from 'react-icons/fa'
import {FiCircle} from 'react-icons/fi'

import {MdAddToPhotos, MdCrop, MdUndo, MdRedo} from 'react-icons/md'

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
import {
  getImageURLFromClipboard,
  writeImageURLToClipboard,
} from '../../../shared/utils/clipboard'

import {IMAGE_SEARCH_PICK, IMAGE_SEARCH_TOGGLE} from '../../../../main/channels'

const ImageEditor =
  typeof window !== 'undefined'
    ? require('@toast-ui/react-image-editor').default
    : null

const BOTTOM_MENU_MAIN = 0
const BOTTOM_MENU_CROP = 1

const RIGHT_MENU_NONE = 0
const RIGHT_MENU_FREEDRAWING = 1

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

function FlipEditor({idx = 0, src, visible, onChange, onChanging}) {
  const {t} = useTranslation()

  // Button menu
  const [isInsertImageMenuOpen, setInsertImageMenuOpen] = useState(false)
  const insertMenuRef = [useRef(), useRef(), useRef(), useRef()]
  // Context menu
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuCursor, setContextMenuCursor] = useState({x: 0, y: 0})

  useClickOutside(insertMenuRef[idx], () => {
    setInsertImageMenuOpen(false)
  })

  const [bottomMenuPanel, setBottomMenuPanel] = useState(BOTTOM_MENU_MAIN)
  const [rightMenuPanel, setRightMenuPanel] = useState(RIGHT_MENU_NONE)

  const [brush, setBrush] = useState(20)
  const [brushColor, setBrushColor] = useState('ff6666dd')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showArrowHint, setShowArrowHint] = useState(src === null && idx === 0)

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
  const CHANGED = 5

  const [changesCnt, setChangesCnt] = useState(NOCHANGES)
  const handleOnChanging = useCallback(() => {
    if (changesCnt === -1) return
    onChanging(idx)
    if (!changesCnt) setChangesCnt(1)
  }, [changesCnt, idx, onChanging])

  const handleOnChanged = useCallback(() => {
    setChangesCnt(CHANGED)
  }, [])

  useInterval(() => {
    if (changesCnt >= NEWCHANGES) {
      setShowArrowHint(false)
      setChangesCnt(changesCnt + 1)
    }
    if (changesCnt >= CHANGED) {
      setChangesCnt(NOCHANGES)
      const url = editors[idx].toDataURL()
      onChange(url)
    }
  }, 200)

  const [insertImageMode, setInsertImageMode] = useState(0)

  const setImageUrl = useCallback(
    data => {
      const {url, insertMode, customEditor} = data
      const nextInsertMode = insertMode || insertImageMode
      const editor = customEditor || editors[idx]
      if (!editor) return

      if (!url) {
        editor.loadImageFromURL(BLANK_IMAGE, 'blank').then(() => {
          setChangesCnt(NOCHANGES)
          onChange(null)
        })
        return
      }

      if (nextInsertMode === INSERT_OBJECT_IMAGE) {
        editor.addImageObject(url).then(() => {
          setChangesCnt(NOCHANGES)
          handleOnChanged()
        })
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
                editor.loadImageFromURL(editor.toDataURL(), 'Bkgd').then(() => {
                  editor.clearUndoStack()
                  editor.clearRedoStack()
                  handleOnChanged()
                })
              })
            })
          })
        })
      }
    },
    [editors, handleOnChanged, idx, insertImageMode, onChange]
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
      if (visible) {
        const [{url}] = data.docs[0].thumbnails
        setImageUrl({url})
      }
      setInsertImageMode(0)
    }
    global.ipcRenderer.on(IMAGE_SEARCH_PICK, handleImageSearchPick)
    return () => {
      global.ipcRenderer.removeListener(
        IMAGE_SEARCH_PICK,
        handleImageSearchPick
      )
    }
  }, [setImageUrl, insertImageMode, visible])

  // Clipbiard handling
  const handleImageFromClipboard = insertMode => {
    const url = getImageURLFromClipboard(IMAGE_WIDTH, IMAGE_HEIGHT)
    if (url) {
      setImageUrl({url, insertMode})
    }
  }

  const handleOnCopy = () => {
    const url = editors[idx] && editors[idx].toDataURL()
    if (url) {
      writeImageURLToClipboard(url)
    }
  }

  const handleOnPaste = () => {
    handleImageFromClipboard(INSERT_BACKGROUND_IMAGE)
  }

  const handleUndo = () => {
    if (editors[idx]) {
      editors[idx].undo().then(() => {
        setChangesCnt(NOCHANGES)
        handleOnChanged()
      })
    }
  }

  const handleRedo = () => {
    if (editors[idx]) {
      editors[idx].redo().then(() => {
        setChangesCnt(NOCHANGES)
        handleOnChanged()
      })
    }
  }

  if (visible) {
    mousetrap.bind(['command+v', 'ctrl+v'], function(e) {
      handleOnPaste()
      e.stopImmediatePropagation()
      return false
    })

    mousetrap.bind(['command+c', 'ctrl+c'], function(e) {
      handleOnCopy()
      e.stopImmediatePropagation()
      return false
    })

    mousetrap.bind(['command+z', 'ctrl+z'], function(e) {
      handleUndo()
      e.stopImmediatePropagation()
      return false
    })

    mousetrap.bind(['shift+ctrl+z', 'shift+command+z'], function(e) {
      handleRedo()
      e.stopImmediatePropagation()
      return false
    })
  }
  // init editor
  useEffect(() => {
    const updateEvents = e => {
      if (!e) return
      e.on({
        mousedown() {
          if (e.getDrawingMode() === 'FREE_DRAWING') {
            setChangesCnt(NOCHANGES)
          }
        },
      })

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
        undoStackChanged() {
          handleOnChanging()
        },
      })
      e.on({
        redoStackChanged() {
          handleOnChanging()
        },
      })
    }

    const contaiterEl = document.querySelectorAll(
      '.tui-image-editor-canvas-container'
    )[idx]

    const contaiterCanvas = document.querySelectorAll('.lower-canvas')[idx]

    if (contaiterEl) {
      contaiterEl.parentElement.style.height = '330px'
      contaiterEl.addEventListener('contextmenu', e => {
        setContextMenuCursor({x: e.layerX, y: e.layerY})
        setShowContextMenu(true)
        e.preventDefault()
      })
    }

    if (contaiterCanvas) {
      contaiterCanvas.style.borderRadius = rem(12)
    }

    const newEditor =
      editorRefs.current[idx] &&
      editorRefs.current[idx].current &&
      editorRefs.current[idx].current.getInstance()

    if (newEditor) {
      if (!editors[idx]) {
        setEditor(idx, newEditor)
        newEditor.setBrush({width: brush, color: brushColor})

        if (src) {
          newEditor.loadImageFromURL(src, 'src').then(() => {
            newEditor.clearUndoStack()
            newEditor.clearRedoStack()
            updateEvents(newEditor)
          })
        } else {
          newEditor.loadImageFromURL(BLANK_IMAGE, 'blank').then(() => {
            newEditor.clearUndoStack()
            newEditor.clearRedoStack()
            updateEvents(newEditor)
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRefs, src, idx])

  return (
    <div
      style={{
        display: `${visible ? '' : 'none'}`,
      }}
    >
      <Flex>
        <Box>
          {showContextMenu && (
            <EditorContextMenu
              x={contextMenuCursor.x}
              y={contextMenuCursor.y}
              onClose={() => {
                setShowContextMenu(false)
              }}
              onCopy={() => {
                handleOnCopy()
              }}
              onPaste={() => {
                handleOnPaste()
              }}
            />
          )}

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
                cornerSize: 10,
                rotatingPointOffset: 20,
                lineWidth: '1',
                cornerColor: '#ffffff',
                cornerStrokeColor: '#000000',
                transparentCorners: false,
                borderColor: `${theme.colors.primary}`,
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

              <ArrowHint
                visible={showArrowHint}
                hint={t('Start from uploading an image')}
                leftHanded
              />

              <IconButton
                tooltip={t('Select file')}
                icon={
                  <FaRegFolder
                    color={theme.colors.primary2}
                    fontSize={rem(20)}
                  />
                }
                onClick={() => {
                  setInsertImageMode(INSERT_BACKGROUND_IMAGE)
                  uploaderRef.current.click()
                }}
              ></IconButton>

              <IconButton
                tooltip={t('Add image')}
                icon={
                  <MdAddToPhotos
                    color={theme.colors.primary2}
                    fontSize={theme.fontSizes.large}
                  />
                }
                onClick={() => {
                  setRightMenuPanel(RIGHT_MENU_NONE)
                  editors[idx].stopDrawingMode()
                  setInsertImageMenuOpen(!isInsertImageMenuOpen)
                }}
              ></IconButton>

              <Divider vertical />

              <IconButton
                tooltip={`${t('Undo')} (${global.isMac ? 'Cmd+Z' : 'Ctrl+Z'})`}
                disabled={editors[idx] && editors[idx].isEmptyUndoStack()}
                icon={
                  <MdUndo
                    color={theme.colors.primary2}
                    fontSize={theme.fontSizes.medium}
                  />
                }
                onClick={() => {
                  handleUndo()
                }}
              ></IconButton>

              <IconButton
                tooltip={`${t('Redo')} (${
                  global.isMac ? 'Cmd+Shift+Z' : 'Ctrl+Shift+Z'
                })`}
                disabled={editors[idx] && editors[idx].isEmptyRedoStack()}
                icon={
                  <MdRedo
                    color={theme.colors.primary2}
                    fontSize={theme.fontSizes.medium}
                  />
                }
                onClick={() => {
                  handleRedo()
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

              <ArrowHint visible={showArrowHint} hint={t('Or start drawing')} />

              <IconButton
                tooltip={t('Draw')}
                active={rightMenuPanel === RIGHT_MENU_FREEDRAWING}
                icon={
                  <FaPencilAlt
                    color={
                      rightMenuPanel === RIGHT_MENU_FREEDRAWING
                        ? null
                        : theme.colors.primary2
                    }
                    fontSize={theme.fontSizes.medium}
                  />
                }
                onClick={() => {
                  setShowArrowHint(false)
                  const editor = editors[idx]
                  if (editor.getDrawingMode() === 'FREE_DRAWING') {
                    setRightMenuPanel(RIGHT_MENU_NONE)
                    editor.stopDrawingMode()
                  } else {
                    setRightMenuPanel(RIGHT_MENU_FREEDRAWING)
                    editor.startDrawingMode('FREE_DRAWING')
                  }
                }}
              ></IconButton>

              <IconButton
                tooltip={t('Clear')}
                icon={
                  <FaRegTrashAlt
                    color={theme.colors.danger}
                    fontSize={theme.fontSizes.medium}
                  />
                }
                onClick={() => {
                  setImageUrl({url: null})
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
              {t('Crop image')}
              <Flex align="center">
                <IconButton
                  onClick={() => {
                    setBottomMenuPanel(BOTTOM_MENU_MAIN)
                    setRightMenuPanel(RIGHT_MENU_NONE)
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
                      const {width, height} = editors[idx].getCropzoneRect()
                      if (width < 1 || height < 1) {
                        editors[idx].stopDrawingMode()
                      } else {
                        editors[idx]
                          .crop(editors[idx].getCropzoneRect())
                          .then(() => {
                            editors[idx].stopDrawingMode()
                            setRightMenuPanel(RIGHT_MENU_NONE)
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

        {rightMenuPanel === RIGHT_MENU_FREEDRAWING && (
          <Box css={{marginTop: rem(10), marginLeft: rem(10)}}>
            <ColorPicker
              color={brushColor}
              visible={showColorPicker}
              onChange={c => {
                setShowColorPicker(false)
                setBrushColor(c)
                if (!editors[idx]) return
                const nextColor = `#${c}`
                editors[idx].setBrush({width: brush, color: nextColor})
              }}
            />
            <IconButton
              icon={
                <FaCircle
                  color={`#${brushColor}`}
                  style={{
                    fontSize: theme.fontSizes.medium,
                    padding: rem(0),
                    border: '1px solid #d2d4d9',
                    borderRadius: '50%',
                  }}
                />
              }
              onClick={() => {
                setShowColorPicker(!showColorPicker)
              }}
            ></IconButton>

            <Divider />

            <Brushes
              brush={brush}
              onChange={b => {
                setBrush(b)
                if (!editors[idx]) return
                editors[idx].setBrush({width: b, color: brushColor})
              }}
            ></Brushes>
          </Box>
        )}
      </Flex>
    </div>
  )
}

FlipEditor.propTypes = {
  idx: PropTypes.number,
  src: PropTypes.string,
  visible: PropTypes.bool,
  onChange: PropTypes.func,
  onChanging: PropTypes.func,
}

export default FlipEditor

function Brushes({brush, onChange}) {
  const brushes = [4, 12, 20, 28, 36]
  return (
    <div>
      {brushes.map((b, i) => (
        <IconButton
          key={i}
          active={brush === b}
          icon={
            <FaCircle
              color={brush === b ? null : theme.colors.primary2}
              style={{padding: rem(6 - i * 1.5)}}
            />
          }
          onClick={() => {
            if (onChange) {
              onChange(b)
            }
          }}
        ></IconButton>
      ))}
    </div>
  )
}

Brushes.propTypes = {
  brush: PropTypes.number,
  onChange: PropTypes.func,
}

function ColorPicker({visible, color, onChange}) {
  const colorPickerRef = useRef()
  const colors = [
    ['ffffff', 'd2d4d9e0', '96999edd', '53565cdd'],
    ['ff6666dd', 'ff60e7dd', 'a066ffdd', '578fffdd'],
    ['0cbdd0dd', '27d980dd', 'ffd763dd', 'ffa366dd'],
  ]

  useClickOutside(colorPickerRef, () => {
    onChange(color)
  })

  return (
    <div
      style={{
        display: `${visible ? '' : 'none'}`,
      }}
    >
      <Box css={position('relative')} ref={colorPickerRef}>
        <Absolute top={0} right={rem(40)} zIndex={100}>
          <Menu>
            {colors.map((row, i) => (
              <Flex key={i} css={{marginLeft: rem(10), marginRight: rem(10)}}>
                {row.map((c, j) => {
                  const showColor = c === 'ffffff' ? '#d2d4d9' : `#${c}`
                  const circleStyle = {
                    padding: rem(1),
                    border: `${color === c ? '1px' : '0px'} solid ${showColor}`,
                    borderRadius: '50%',
                    fontSize: theme.fontSizes.large,
                  }
                  return (
                    <IconButton
                      key={`${j}${j}`}
                      icon={
                        c === 'ffffff' ? (
                          <FiCircle color={showColor} style={circleStyle} />
                        ) : (
                          <FaCircle color={showColor} style={circleStyle} />
                        )
                      }
                      onClick={() => {
                        if (onChange) {
                          onChange(c)
                        }
                      }}
                    ></IconButton>
                  )
                })}
              </Flex>
            ))}
          </Menu>
        </Absolute>
      </Box>
    </div>
  )
}

ColorPicker.propTypes = {
  visible: PropTypes.bool,
  color: PropTypes.string,
  onChange: PropTypes.func,
}

function ArrowHint({hint, leftHanded, visible}) {
  //
  return (
    visible && (
      <div>
        <Box css={position('relative')}>
          <Absolute top={rem(-105)} left={rem(0)} zIndex={90}>
            {leftHanded && (
              <div>
                <div
                  style={{
                    minWidth: rem(24),
                    minHeight: rem(40),
                    borderLeft: `2px solid ${theme.colors.primary}`,
                    borderTop: `2px solid ${theme.colors.primary}`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '-5px',
                    width: 0,
                    height: 0,
                    borderTop: `6px solid transparent`,
                    borderLeft: `6px solid transparent`,
                    borderRight: `6px solid transparent`,
                    borderBottom: 0,
                    borderTopColor: `${theme.colors.primary}`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '30px',
                    top: '-25px',
                    minWidth: '70px',
                    color: `${theme.colors.muted}`,
                    fontWeight: `${theme.fontWeights.normal}`,
                  }}
                >
                  {hint}
                </div>
              </div>
            )}

            {!leftHanded && (
              <div>
                <div
                  style={{
                    minWidth: rem(24),
                    minHeight: rem(40),
                    borderRight: `2px solid ${theme.colors.primary}`,
                    borderTop: `2px solid ${theme.colors.primary}`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    width: 0,
                    height: 0,
                    marginLeft: '0px',
                    borderLeft: `6px solid transparent`,
                    borderRight: `6px solid transparent`,
                    borderTop: `6px solid transparent`,
                    borderBottom: 0,
                    borderTopColor: `${theme.colors.primary}`,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: '-56px',
                    top: '-25px',
                    minWidth: rem(50, theme.fontSizes.base),
                    width: rem(50, theme.fontSizes.base),
                    color: `${theme.colors.muted}`,
                    fontWeight: `${theme.fontWeights.normal}`,
                    ...wordWrap('break-all'),
                  }}
                >
                  {hint}
                </div>
              </div>
            )}
          </Absolute>
        </Box>
      </div>
    )
  )
}

ArrowHint.propTypes = {
  hint: PropTypes.string,
  leftHanded: PropTypes.bool,
  visible: PropTypes.bool,
}

EditorContextMenu.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onCopy: PropTypes.func,
  onPaste: PropTypes.func,
}

function EditorContextMenu({x, y, onClose, onCopy, onPaste}) {
  const {t} = useTranslation()

  const contextMenuRef = useRef()
  useClickOutside(contextMenuRef, () => {
    onClose()
  })

  return (
    <Box>
      <Flex>
        <Box css={position('relative')}>
          <Box ref={contextMenuRef}>
            <Absolute top={y} left={x} zIndex={100}>
              <Menu>
                <MenuItem
                  disabled={!onCopy}
                  onClick={() => {
                    onCopy()
                    onClose()
                  }}
                  icon={<FaCopy fontSize={rem(20)} />}
                >
                  {`${t('Copy')} (${global.isMac ? 'Cmd+C' : 'Ctrl+C'})`}
                </MenuItem>

                <MenuItem
                  disabled={!onPaste}
                  onClick={() => {
                    onPaste()
                    onClose()
                  }}
                  icon={<FaPaste fontSize={rem(20)} />}
                >
                  {`${t('Paste image')} (${global.isMac ? 'Cmd+V' : 'Ctrl+V'})`}
                </MenuItem>
              </Menu>
            </Absolute>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
