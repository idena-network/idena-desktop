/* eslint-disable react/prop-types */
import React, {createRef, useRef, useCallback, useState} from 'react'
import {rem, position} from 'polished'
import Jimp from 'jimp'
import {useTranslation} from 'react-i18next'
import mousetrap from 'mousetrap'
import {
  Box,
  Stack,
  VisuallyHidden,
  IconButton as ChakraIconButton,
  Divider,
  Icon,
  useToast,
} from '@chakra-ui/core'
import {useEpochState} from '../../../shared/providers/epoch-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Menu, MenuItem} from '../../../shared/components/menu'
import {useInterval} from '../../../shared/hooks/use-interval'
import {Toast, Tooltip} from '../../../shared/components/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {resizing, imageResize} from '../../../shared/utils/img'
import {
  getImageURLFromClipboard,
  writeImageURLToClipboard,
} from '../../../shared/utils/clipboard'
import {
  Brushes,
  ColorPicker,
  ArrowHint,
  EditorContextMenu,
  ImageEraseEditor,
  ApplyChangesBottomPanel,
} from './flip-editor-tools'
import {ImageSearchDialog} from './image-search'

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
const SHADOW_IMAGE_DATAURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGUmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0xMi0xNFQxOTo0ODo0NyswNTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMC0xMi0xNFQxOTo0ODo0NyswNTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTItMTRUMTk6NDg6NDcrMDU6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N2E3N2JjODgtMmY5Zi0yZTQ2LTg3YzItMWIwY2MyNmU1MDEzIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6ZDljNDkxYWItZTZjNy1lNzQwLWEyM2YtYzhmNTY3NGI1MmQ2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZDA4NzlhOWUtMTg0NS1mODQ1LWEyNjktNDQ3YjJlOTA4MGI2IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDA4NzlhOWUtMTg0NS1mODQ1LWEyNjktNDQ3YjJlOTA4MGI2IiBzdEV2dDp3aGVuPSIyMDIwLTEyLTE0VDE5OjQ4OjQ3KzA1OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3YTc3YmM4OC0yZjlmLTJlNDYtODdjMi0xYjBjYzI2ZTUwMTMiIHN0RXZ0OndoZW49IjIwMjAtMTItMTRUMTk6NDg6NDcrMDU6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6ODdmMTc3ZWMtN2VhNi04OTQ3LTk3NjgtNWM4NzY2ZWY1MGYxPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+7upEZAAAAAtJREFUCB1jAAIpAAAfABtLdwBIAAAAAElFTkSuQmCC'

const BLANK_IMAGE_DATAURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVQYlWP4//8/AAX+Av5e8BQ1AAAAAElFTkSuQmCC'
const BLANK_IMAGE =
  global.nativeImage &&
  global.nativeImage
    .createFromDataURL(BLANK_IMAGE_DATAURL)
    .resize({width: IMAGE_WIDTH, height: IMAGE_HEIGHT})
    .toDataURL()

export default function FlipEditor({
  idx = 0,
  src,
  visible,
  onChange,
  onChanging,
}) {
  const {t} = useTranslation()

  const toast = useToast()

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
  const [showArrowHint, setShowArrowHint] = useState(!src && idx === 0)

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

  const [isSelectionCreated, setIsSelectionCreated] = useState(null)
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

  const epoch = useEpochState()
  const bottomWatermark = epoch && `${epoch.nextValidation.substr(5, 5)}`

  const setImageUrl = useCallback(
    (data, onDone = null) => {
      const {url, insertMode, customEditor, watermark} = data
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
            const resizedNextUrl = imageResize(
              global.nativeImage.createFromDataURL(nextUrl),
              IMAGE_WIDTH,
              IMAGE_HEIGHT
            )
            editor.addImageObject(resizedNextUrl).then(objectProps => {
              if (data.replaceObjectId) {
                editors[idx].setObjectPropertiesQuietly(
                  objectProps.id,
                  replaceObjectProps
                )
              }

              handleOnChanged()
              setActiveObjectId(objectProps.id)
              setActiveObjectUrl(resizedNextUrl)

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
              editor.addImageObject(url).then(async objectProps2 => {
                const {id: id2} = objectProps2

                editor.setObjectPropertiesQuietly(id2, {
                  left: IMAGE_WIDTH / 2,
                  top: IMAGE_HEIGHT / 2,
                  scaleX: newWidth / width,
                  scaleY: newHeight / height,
                })

                if (watermark) {
                  const {id: shadowId2} = await editor.addImageObject(
                    SHADOW_IMAGE_DATAURL
                  )
                  editor.setObjectPropertiesQuietly(shadowId2, {
                    left: IMAGE_WIDTH / 2,
                    top: IMAGE_HEIGHT / 2,
                    scaleX: IMAGE_WIDTH,
                    scaleY: IMAGE_HEIGHT,
                  })

                  const xPos = IMAGE_WIDTH / 2 + Math.random() * 30 - 15
                  const yPos = IMAGE_HEIGHT / 2 + Math.random() * 40 - 20
                  const anglePos = Math.random() * 70 - 35

                  const angleRad = (Math.PI * anglePos) / 180
                  const xPos2 = xPos - 80 * Math.sin(angleRad)
                  const yPos2 = yPos + 80 * Math.abs(Math.cos(angleRad))

                  const {id: textOjectId} = await editor.addText(watermark, {
                    styles: {
                      fill: '#ffffff35',
                      fontFamily: 'Inter',
                      fontSize: 170,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    },
                    position: {
                      x: xPos,
                      y: yPos,
                    },
                  })

                  editor.setObjectPropertiesQuietly(textOjectId, {
                    angle: anglePos,
                  })

                  const {id: textOjectId1} = await editor.addText(
                    'www.idena.io',
                    {
                      styles: {
                        fill: '#ffffff35',
                        fontFamily: 'Inter',
                        fontSize: 40,
                        fontWeight: 'normal',
                        textAlign: 'center',
                      },
                      position: {
                        x: xPos2,
                        y: yPos2,
                      },
                    }
                  )

                  editor.setObjectPropertiesQuietly(textOjectId1, {
                    angle: anglePos,
                  })
                }
                await editor.loadImageFromURL(editor.toDataURL(), 'Bkgd')
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
      setImageUrl({url, watermark: bottomWatermark})
      setInsertImageMode(0)
    })
    reader.readAsDataURL(file)
    e.target.value = ''
  }

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
            setImageUrl({
              url,
              watermark: bottomWatermark,
              insertMode: INSERT_OBJECT_IMAGE,
            })
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

  function getEditorActiveObjectId(editor) {
    const objId =
      editor &&
      editor._graphics &&
      editor._graphics._canvas &&
      editor._graphics._canvas._activeObject &&
      editor._graphics._canvas._activeObject.__fe_id
    return objId
  }

  function getEditorObjectUrl(editor, objId) {
    const obj =
      objId && editor && editor._graphics && editor._graphics._objects[objId]
    const url = obj && obj._element && obj._element.src

    return url
  }

  function getEditorObjectProps(editor, objId) {
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
  React.useEffect(() => {
    const updateEvents = e => {
      if (!e) return
      e.on({
        mousedown() {
          setShowContextMenu(false)

          const editor = getEditorInstance()
          const objId = getEditorActiveObjectId(editor)
          const url = getEditorObjectUrl(editor, objId)

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
          const objId = getEditorActiveObjectId(editor)
          const url = getEditorObjectUrl(editor, objId)

          setActiveObjectId(objId)
          setActiveObjectUrl(url)

          handleOnChanging()
        },
      })
      e.on({
        redoStackChanged() {
          const editor = getEditorInstance()
          const objId = getEditorActiveObjectId(editor)
          const url = getEditorObjectUrl(editor, objId)

          setActiveObjectId(objId)
          setActiveObjectUrl(url)

          handleOnChanging()
        },
      })

      e.on({
        selectionCreated() {
          setIsSelectionCreated(true)
        },
      })

      e.on({
        selectionCleared() {
          setIsSelectionCreated(false)
        },
      })
    }

    const containerEl = document.querySelectorAll(
      '.tui-image-editor-canvas-container'
    )[idx]

    const containerCanvas = document.querySelectorAll('.lower-canvas')[idx]

    if (containerEl) {
      containerEl.parentElement.style.height = rem(328)
      containerEl.addEventListener('contextmenu', e => {
        setContextMenuCursor({x: e.layerX, y: e.layerY})
        setShowContextMenu(true)
        setRightMenuPanel(RightMenu.None)
        if (editors[idx]) {
          editors[idx].stopDrawingMode()
        }
        e.preventDefault()
      })
    }

    if (containerCanvas) {
      containerCanvas.style.borderRadius = rem(8)
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

    return () => {
      mousetrap.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRefs, src, idx])

  const [showImageSearch, setShowImageSearch] = React.useState()

  React.useEffect(() => {
    if (showImageSearch || !visible) {
      editorRefs.current[idx].current.getInstance().discardSelection()
    }
  }, [idx, showImageSearch, visible])

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
              imageObjectProps={getEditorObjectProps(
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

          <Box
            h={rem(IMAGE_HEIGHT)}
            w={rem(IMAGE_WIDTH)}
            border="1px"
            borderColor="brandGray.016"
            rounded="lg"
          >
            <ImageEditor
              key={idx}
              ref={editorRefs.current[idx]}
              cssMaxHeight={IMAGE_HEIGHT}
              cssMaxWidth={IMAGE_WIDTH}
              selectionStyle={{
                cornerSize: 8,
                rotatingPointOffset: 20,
                lineWidth: '1',
                cornerColor: theme.colors.white,
                cornerStrokeColor: theme.colors.primary,
                transparentCorners: false,
                borderColor: theme.colors.primary,
              }}
              usageStatistics={false}
            />
          </Box>

          {bottomMenuPanel === BottomMenu.Main && (
            <Stack isInline align="center" spacing={3} mt={6}>
              <FlipEditorIcon
                tooltip={t('Search on web')}
                icon="search"
                onClick={() => {
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
                  setInsertImageMode(INSERT_BACKGROUND_IMAGE)
                  setShowImageSearch(true)
                }}
              />

              <ArrowHint
                visible={showArrowHint}
                hint={t('Start from uploading an image')}
                leftHanded
              />

              <FlipEditorIcon
                tooltip={t('Select file')}
                icon="folder"
                onClick={() => {
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
                  setInsertImageMode(INSERT_BACKGROUND_IMAGE)
                  uploaderRef.current.click()
                }}
              />
              <VisuallyHidden>
                <input
                  id="file"
                  type="file"
                  accept="image/*"
                  ref={uploaderRef}
                  onChange={handleUpload}
                />
              </VisuallyHidden>

              <FlipEditorIcon
                tooltip={t('Add image')}
                icon="add-image"
                onClick={() => {
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
                  editors[idx].stopDrawingMode()
                  setRightMenuPanel(RightMenu.None)
                  setInsertImageMenuOpen(!isInsertImageMenuOpen)
                }}
              />

              <FlipEditorToolbarDivider />

              <FlipEditorIcon
                icon="undo"
                tooltip={`${t('Undo')} (${global.isMac ? 'Cmd+Z' : 'Ctrl+Z'})`}
                isDisabled={editors[idx] && editors[idx].isEmptyUndoStack()}
                onClick={handleUndo}
              />
              <FlipEditorIcon
                icon="redo"
                tooltip={`${t('Redo')} (${
                  global.isMac ? 'Cmd+Shift+Z' : 'Ctrl+Shift+Z'
                })`}
                isDisabled={editors[idx] && editors[idx].isEmptyUndoStack()}
                onClick={handleRedo}
              />

              <FlipEditorToolbarDivider />

              <FlipEditorIcon
                tooltip={t('Crop image')}
                icon="crop"
                isDisabled={src === null}
                onClick={() => {
                  editors[idx].startDrawingMode('CROPPER')
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                  }
                  setBottomMenuPanel(BottomMenu.Crop)
                }}
              />

              <ArrowHint visible={showArrowHint} hint={t('Or start drawing')} />

              <FlipEditorIcon
                tooltip={t('Draw')}
                isActive={rightMenuPanel === RightMenu.FreeDrawing}
                icon="draw"
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
              />

              <FlipEditorIcon
                isDisabled={!activeObjectUrl}
                tooltip={
                  activeObjectUrl ? t('Erase') : t('Select image to erase')
                }
                isActive={rightMenuPanel === RightMenu.Erase}
                icon="eraser"
                onClick={() => {
                  if (rightMenuPanel === RightMenu.Erase) {
                    setRightMenuPanel(RightMenu.None)
                    setBottomMenuPanel(BottomMenu.Main)
                  } else {
                    setRightMenuPanel(RightMenu.Erase)
                    setBottomMenuPanel(BottomMenu.Erase)
                  }
                }}
              />

              <FlipEditorToolbarDivider />

              <FlipEditorIcon
                tooltip={t('Clear')}
                icon="flip-editor-delete"
                color="red.500"
                _hover={{color: 'red.500'}}
                onClick={handleOnClear}
              />
            </Stack>
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
                    <Box
                      position="absolute"
                      top="-11.4em"
                      right="-17em"
                      zIndex={100}
                    >
                      <Menu>
                        <MenuItem
                          onClick={async () => {
                            setInsertImageMenuOpen(false)
                            setInsertImageMode(INSERT_OBJECT_IMAGE)
                            setShowImageSearch(true)
                          }}
                          disabled={false}
                          icon={<Icon size={5} name="search" />}
                        >
                          {t('Search on web')}
                        </MenuItem>
                        <MenuItem
                          onClick={async () => {
                            setInsertImageMenuOpen(false)
                            setInsertImageMode(INSERT_OBJECT_IMAGE)
                            uploaderRef.current.click()
                          }}
                          disabled={false}
                          icon={<Icon size={5} name="folder" />}
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
                          icon={<Icon size={5} name="clipboard" />}
                        >
                          {t('Paste image')}
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>
                )}
              </Box>
            </Flex>
          </Box>
        </Box>

        {(rightMenuPanel === RightMenu.FreeDrawing ||
          rightMenuPanel === RightMenu.Erase) && (
          <Stack align="center" ml={6}>
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
                <Box
                  bg={`#${brushColor}`}
                  border="1px"
                  borderColor="brandGray.016"
                  rounded="full"
                  size={4}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />

                <Divider borderColor="gray.300" w={6} />
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
          </Stack>
        )}
      </Flex>
      <ImageSearchDialog
        isOpen={showImageSearch}
        onPick={url => {
          if (visible) {
            setImageUrl({url, watermark: bottomWatermark})
          }
          setInsertImageMode(0)
          setShowImageSearch(false)
        }}
        onClose={() => {
          setShowImageSearch(false)
        }}
        onError={error =>
          toast({
            // eslint-disable-next-line react/display-name
            render: () => <Toast title={error} status="error" />,
          })
        }
      />
    </div>
  )
}

// eslint-disable-next-line react/prop-types
function FlipEditorIcon({tooltip, isActive, isDisabled, mr, ...props}) {
  const icon = (
    <ChakraIconButton
      aria-label={tooltip}
      isDisabled={isDisabled}
      bg={isActive ? 'gray.50' : 'unset'}
      color={isActive ? 'brandBlue.500' : 'unset'}
      fontSize={rem(20)}
      size={6}
      rounded="md"
      p="1/2"
      _hover={{color: isDisabled ? 'inherit' : 'brandBlue.500'}}
      _active={{bg: 'transparent'}}
      {...props}
    />
  )
  return (
    <Box mr={mr}>
      {isDisabled ? (
        <Tooltip content={tooltip}>{icon}</Tooltip>
      ) : (
        <Tooltip label={tooltip}>{icon}</Tooltip>
      )}
    </Box>
  )
}

function FlipEditorToolbarDivider(props) {
  return (
    <Divider
      orientation="vertical"
      borderColor="gray.300"
      h={5}
      mx={0}
      {...props}
    />
  )
}
