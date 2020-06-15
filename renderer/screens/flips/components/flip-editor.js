import React, {createRef, useRef, useCallback, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {rem, position} from 'polished'
import {
  FaGoogle,
  FaCircle,
  FaPaste,
  FaRegFolder,
  FaPencilAlt,
  FaEraser,
  FaRegTrashAlt,
} from 'react-icons/fa'
import Jimp from 'jimp'

import {MdAddToPhotos, MdCrop, MdUndo, MdRedo} from 'react-icons/md'

import {useTranslation} from 'react-i18next'
import mousetrap from 'mousetrap'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'
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

import {
  Brushes,
  ColorPicker,
  ArrowHint,
  EditorContextMenu,
  ImageEraseEditor,
  ApplyChangesBottomPanel,
} from './flip-editor-tools'

const ImageEditor =
  typeof window !== 'undefined'
    ? require('@toast-ui/react-image-editor').default
    : null

const BottomMenu = {
  Main: 0,
  Crop: 1,
  Erase: 2,
}

const RightMenu = {
  None: 0,
  FreeDrawing: 1,
  Erase: 2,
}

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

  const [bottomMenuPanel, setBottomMenuPanel] = useState(BottomMenu.Main)
  const [rightMenuPanel, setRightMenuPanel] = useState(RightMenu.None)

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

  const [isSelectionCreated, SetIsSelectionCreated] = useState(null)
  const [activeObjectUrl, setActiveObjectUrl] = useState(null)
  const [activeObjectId, setActiveObjectId] = useState(null)

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
    (data, onDone = null) => {
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
        setChangesCnt(NOCHANGES)

        let replaceObjectProps
        if (data.replaceObjectId) {
          replaceObjectProps = editors[
            idx
          ].getObjectProperties(data.replaceObjectId, ['left', 'top', 'angle'])
          editors[idx].execute('removeObject', data.replaceObjectId)
        }
        Jimp.read(url).then(image => {
          image.getBase64Async('image/png').then(nextUrl => {
            editor.addImageObject(nextUrl).then(objectProps => {
              if (data.replaceObjectId) {
                editors[idx].setObjectPropertiesQuietly(
                  objectProps.id,
                  replaceObjectProps
                )
              }

              handleOnChanged()
              setActiveObjectId(objectProps.id)
              setActiveObjectUrl(nextUrl)

              if (onDone) onDone()

              if (editors[idx]._graphics) {
                editors[idx]._graphics.renderAll()
              }
            })
          })
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
                  scaleX: newWidth / width,
                  scaleY: newHeight / height,
                })
                editor.loadImageFromURL(editor.toDataURL(), 'Bkgd').then(() => {
                  editor.clearUndoStack()
                  editor.clearRedoStack()
                  handleOnChanged()
                  if (onDone) onDone()

                  if (editors[idx]._graphics) {
                    editors[idx]._graphics.renderAll()
                  }
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

  // Clipboard handling
  const handleImageFromClipboard = (insertMode = null) => {
    const url = getImageURLFromClipboard(IMAGE_WIDTH, IMAGE_HEIGHT)
    if (url) {
      if (insertMode) {
        setImageUrl({url, insertMode})
      } else {
        // Auto detect insert mode by image size
        let img = new Image()
        img.src = url
        img.onload = function() {
          if (img.width === IMAGE_WIDTH && img.height === IMAGE_HEIGHT) {
            setImageUrl({url, insertMode: INSERT_BACKGROUND_IMAGE})
          } else {
            setImageUrl({url, insertMode: INSERT_OBJECT_IMAGE})
          }
          img = null
        }
      }
    }
  }

  const {addNotification} = useNotificationDispatch()

  const handleOnCopy = () => {
    const url = activeObjectUrl || (editors[idx] && editors[idx].toDataURL())
    if (url) {
      writeImageURLToClipboard(url)
      addNotification({
        title: t('Copied'),
      })
    }
  }

  const handleOnPaste = () => {
    handleImageFromClipboard()
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

  const handleOnDelete = () => {
    if (editors[idx]) {
      editors[idx].removeActiveObject()
      setChangesCnt(NOCHANGES)
      handleOnChanged()
    }
  }

  const handleOnClear = () => {
    if (rightMenuPanel === RightMenu.Erase) {
      setRightMenuPanel(RightMenu.None)
    }
    setImageUrl({url: null})
  }

  if (visible) {
    mousetrap.bind(['del'], function(e) {
      handleOnDelete()
      e.stopImmediatePropagation()
      return false
    })

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

  function getEditorInstance() {
    const editor =
      editorRefs.current[idx] &&
      editorRefs.current[idx].current &&
      editorRefs.current[idx].current.getInstance()
    return editor
  }

  function getEditorActiveObjecId(editor) {
    const objId =
      editor &&
      editor._graphics &&
      editor._graphics._canvas &&
      editor._graphics._canvas._activeObject &&
      editor._graphics._canvas._activeObject.__fe_id
    return objId
  }

  function getEditorObjecUrl(editor, objId) {
    const obj =
      objId && editor && editor._graphics && editor._graphics._objects[objId]
    const url = obj && obj._element && obj._element.src

    return url
  }

  function getEditorObjecProps(editor, objId) {
    const obj =
      objId && editor && editor._graphics && editor._graphics._objects[objId]
    if (obj) {
      return {
        x: obj.translateX,
        y: obj.translateY,
        width: obj.width,
        height: obj.height,
        angle: obj.angle,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
      }
    }
    return null
  }

  // init editor
  useEffect(() => {
    const updateEvents = e => {
      if (!e) return
      e.on({
        mousedown() {
          setShowContextMenu(false)

          const editor = getEditorInstance()
          const objId = getEditorActiveObjecId(editor)
          const url = getEditorObjecUrl(editor, objId)

          setActiveObjectId(objId)
          setActiveObjectUrl(url)

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
          const editor = getEditorInstance()
          const objId = getEditorActiveObjecId(editor)
          const url = getEditorObjecUrl(editor, objId)

          setActiveObjectId(objId)
          setActiveObjectUrl(url)

          handleOnChanging()
        },
      })
      e.on({
        redoStackChanged() {
          const editor = getEditorInstance()
          const objId = getEditorActiveObjecId(editor)
          const url = getEditorObjecUrl(editor, objId)

          setActiveObjectId(objId)
          setActiveObjectUrl(url)

          handleOnChanging()
        },
      })
      e.on({
        objectActivated() {
          //
        },
      })

      e.on({
        selectionCreated() {
          SetIsSelectionCreated(true)
        },
      })

      e.on({
        selectionCleared() {
          SetIsSelectionCreated(false)
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
        setRightMenuPanel(RightMenu.None)
        if (editors[idx]) {
          editors[idx].stopDrawingMode()
        }
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
          {(bottomMenuPanel === BottomMenu.Erase ||
            rightMenuPanel === RightMenu.Erase) && (
            <ImageEraseEditor
              url={activeObjectUrl}
              isDone={bottomMenuPanel !== BottomMenu.Erase}
              brushWidth={brush}
              imageObjectProps={getEditorObjecProps(
                editors[idx],
                activeObjectId
              )}
              onChanging={() => {
                if (editors[idx] && activeObjectId) {
                  setChangesCnt(NOCHANGES)
                  editors[idx].setObjectPropertiesQuietly(activeObjectId, {
                    opacity: 0,
                  })
                }
              }}
              onDone={url => {
                if (url) {
                  if (editors[idx] && activeObjectId) {
                    setChangesCnt(NOCHANGES)
                    editors[idx].setObjectPropertiesQuietly(activeObjectId, {
                      opacity: 1,
                    })
                  }

                  setImageUrl(
                    {
                      url,
                      insertMode: INSERT_OBJECT_IMAGE,
                      replaceObjectId: activeObjectId,
                    },
                    () => {
                      setRightMenuPanel(RightMenu.None)
                    }
                  )
                }
              }}
            />
          )}

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
              onDelete={
                activeObjectId || isSelectionCreated ? handleOnDelete : null
              }
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

          {bottomMenuPanel === BottomMenu.Main && (
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
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
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
                  setBottomMenuPanel(BottomMenu.Crop)
                }}
              ></IconButton>

              <ArrowHint visible={showArrowHint} hint={t('Or start drawing')} />

              <IconButton
                tooltip={t('Draw')}
                active={rightMenuPanel === RightMenu.FreeDrawing}
                icon={
                  <FaPencilAlt
                    color={
                      rightMenuPanel === RightMenu.FreeDrawing
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
                    setRightMenuPanel(RightMenu.None)
                    editor.stopDrawingMode()
                  } else {
                    setRightMenuPanel(RightMenu.FreeDrawing)
                    editor.startDrawingMode('FREE_DRAWING')
                  }
                }}
              ></IconButton>

              <IconButton
                disabled={!activeObjectUrl}
                tooltip={
                  activeObjectUrl ? t('Erase') : t('Select image to erase')
                }
                icon={
                  <FaEraser
                    fontSize={theme.fontSizes.medium}
                    color={
                      rightMenuPanel === RightMenu.Erase
                        ? null
                        : theme.colors.primary2
                    }
                  />
                }
                onClick={() => {
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                    setBottomMenuPanel(BottomMenu.Main)
                  } else {
                    setRightMenuPanel(RightMenu.Erase)
                    setBottomMenuPanel(BottomMenu.Erase)
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
                  handleOnClear()
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

          {bottomMenuPanel === BottomMenu.Crop && (
            <ApplyChangesBottomPanel
              label={t('Crop image')}
              onCancel={() => {
                setBottomMenuPanel(BottomMenu.Main)
                setRightMenuPanel(RightMenu.None)
                if (editors[idx]) {
                  editors[idx].stopDrawingMode()
                }
              }}
              onDone={() => {
                setBottomMenuPanel(BottomMenu.Main)
                if (editors[idx]) {
                  const {width, height} = editors[idx].getCropzoneRect()
                  if (width < 1 || height < 1) {
                    editors[idx].stopDrawingMode()
                  } else {
                    editors[idx]
                      .crop(editors[idx].getCropzoneRect())
                      .then(() => {
                        editors[idx].stopDrawingMode()
                        setRightMenuPanel(RightMenu.None)
                        setImageUrl({
                          url: editors[idx].toDataURL(),
                          insertMode: INSERT_BACKGROUND_IMAGE,
                          customEditor: editors[idx],
                        })
                      })
                  }
                }
              }}
            />
          )}

          {bottomMenuPanel === BottomMenu.Erase && (
            <ApplyChangesBottomPanel
              label={t('Erase')}
              onCancel={() => {
                if (editors[idx] && activeObjectId) {
                  setChangesCnt(NOCHANGES)
                  editors[idx].setObjectPropertiesQuietly(activeObjectId, {
                    opacity: 1,
                  })
                }

                setBottomMenuPanel(BottomMenu.Main)
                setRightMenuPanel(RightMenu.None)
              }}
              onDone={() => {
                setBottomMenuPanel(BottomMenu.Main)
              }}
            />
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

        {(rightMenuPanel === RightMenu.FreeDrawing ||
          rightMenuPanel === RightMenu.Erase) && (
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

            {rightMenuPanel === RightMenu.FreeDrawing && (
              <>
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
              </>
            )}

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
