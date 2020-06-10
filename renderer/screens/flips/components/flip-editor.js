import React, {
  createRef,
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react'
import PropTypes from 'prop-types'
import {rem, position, wordWrap} from 'polished'
import {
  FaGoogle,
  FaCircle,
  FaCopy,
  FaPaste,
  FaRegFolder,
  FaPencilAlt,
  FaEraser,
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

  const [activeObject, setActiveObject] = useState(null)

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
    e.target.value = ''
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
      e.on({
        objectActivated(e) {
          setActiveObject(e)

          const newEditor =
            editorRefs.current[idx] &&
            editorRefs.current[idx].current &&
            editorRefs.current[idx].current.getInstance()

          console.log(e, newEditor)
          const el = newEditor._graphics._objects[e.id]._element
          console.log(el)
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
      <ImageBackgroundEditor
        url={null}
        onChange={url => {
          setImageUrl({url, insertMode: INSERT_OBJECT_IMAGE})
        }}
      />

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
                  <FaEraser
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

                  editor.stopDrawingMode()
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

function ImageBackgroundEditor({url, onChange}) {
  const canvasRef = useRef()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [prevMousePoint, setPrevMousePoint] = useState()

  const handleMouseMove = useCallback(
    e => {
      const ctx = canvasRef.current && canvasRef.current.getContext('2d')

      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY
      if (ctx && isMouseDown) {
        ctx.globalCompositeOperation = 'destination-out'

        ctx.beginPath()
        ctx.arc(x, y, 10, 0, 2 * Math.PI)
        ctx.fill()

        if (prevMousePoint) {
          ctx.lineWidth = 20
          ctx.beginPath()
          ctx.moveTo(prevMousePoint.x, prevMousePoint.y)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
      }
      setPrevMousePoint({x, y})
    },
    [canvasRef, isMouseDown, prevMousePoint]
  )

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
    if (canvasRef.current) {
      onChange(canvasRef.current.toDataURL())
    }
  }

  const handleMouseOut = () => {
    setIsMouseDown(false)
  }

  useEffect(() => {
    let ignore = false

    async function init() {
      if (!ignore && canvasRef.current) {
        const img = new Image()
        img.src =
          'data:image/jpeg;base64,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'
        img.onload = function() {
          const width = Math.min(500, img.width)
          const height = img.height * (width / img.width)

          const ctx = canvasRef.current.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
        }
      }
    }

    init()

    return () => {
      ignore = true
    }
  }, [canvasRef])

  return (
    <div
      style={{
        background:
          "url('https://cloud.githubusercontent.com/assets/4652816/12771954/41dccb10-ca68-11e5-9db8-a473f51426c8.jpg')",
        backgroundSize: 'cover',
      }}
    >
      <canvas
        style={{background: 'transparent'}}
        ref={canvasRef}
        height={300}
        width={500}
        onMouseMove={e => handleMouseMove(e)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  )
}

ImageBackgroundEditor.propTypes = {
  url: PropTypes.string,
  onChange: PropTypes.func,
}
