import React, {useRef, useCallback, useEffect, useState} from 'react'
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

import {useInterval} from '../../../shared/hooks/use-interval'

import {useTranslation} from 'react-i18next'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Menu, MenuItem} from '../../../shared/components/menu'

import {IconButton} from '../../../shared/components/button'
import {Box, Absolute, Input} from '../../../shared/components'
import Divider from '../../../shared/components/divider'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

export function Brushes({brush, onChange}) {
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

export function ColorPicker({visible, color, onChange}) {
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

export function ArrowHint({hint, leftHanded, visible}) {
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
  onDelete: PropTypes.func,
  onClear: PropTypes.func,
  onBringOnTop: PropTypes.func,
}

export function EditorContextMenu({
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onDelete,
  onClear,
  onBringOnTop,
}) {
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

                {onBringOnTop && (
                  <MenuItem
                    onClick={() => {
                      onBringOnTop()
                      onClose()
                    }}
                  >
                    {`${t('Bring on top')} `}
                  </MenuItem>
                )}

                {true && (
                  <MenuItem
                    disabled={!onDelete}
                    onClick={() => {
                      onDelete()
                      onClose()
                    }}
                    icon={<i className="icon icon--delete" />}
                  >
                    {`${t('Delete')} `}
                  </MenuItem>
                )}

                {onClear && (
                  <MenuItem
                    onClick={() => {
                      onClear()
                      onClose()
                    }}
                    icon={
                      <FaRegTrashAlt
                        color={theme.colors.danger}
                        fontSize={rem(20)}
                      />
                    }
                  >
                    {`${t('Clear')} `}
                  </MenuItem>
                )}
              </Menu>
            </Absolute>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

export function ImageEraseEditor({
  url,
  brushWidth,
  imageObjectProps,
  onDone,
  onChanging,
  isDone,
}) {
  useEffect(() => {
    if (isDone) {
      if (canvasRef.current) {
        onDone(canvasRef.current.toDataURL())
      }
    }
  }, [isDone])

  const canvasRef = useRef()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [prevMousePoint, setPrevMousePoint] = useState()

  const handleMouseMove = useCallback(
    e => {
      const ctx = canvasRef.current && canvasRef.current.getContext('2d')

      const x = e.nativeEvent.offsetX
      const y = e.nativeEvent.offsetY
      if (ctx && isMouseDown) {
        onChanging()
        ctx.globalCompositeOperation = 'destination-out'

        ctx.beginPath()
        ctx.arc(x, y, brushWidth / 2, 0, 2 * Math.PI)
        ctx.fill()

        /*
        if (prevMousePoint) {
          ctx.lineWidth = 20
          ctx.beginPath()
          ctx.moveTo(prevMousePoint.x, prevMousePoint.y)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
        */
      }
      setPrevMousePoint({x, y})
    },
    [canvasRef, isMouseDown, prevMousePoint]
  )

  const handleMouseDown = () => {
    setIsMouseDown(true)

    onChanging()
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  useEffect(() => {
    let ignore = false

    async function init() {
      if (!ignore && canvasRef.current) {
        let img = new Image()
        img.setAttribute('crossOrigin', 'anonymous')
        img.src = url
        img.onload = function() {
          const width =
            img.width * ((imageObjectProps && imageObjectProps.scaleX) || 1)
          const height =
            img.height * ((imageObjectProps && imageObjectProps.scaleY) || 1)
          canvasRef.current.width = width
          canvasRef.current.height = height

          const ctx = canvasRef.current.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          img = null
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [canvasRef])

  console.log(imageObjectProps)

  const x =
    imageObjectProps &&
    imageObjectProps.x -
      (imageObjectProps.width * imageObjectProps.scaleX) / 2 +
      1
  const y =
    imageObjectProps &&
    imageObjectProps.y -
      (imageObjectProps.height * imageObjectProps.scaleY) / 2 +
      1

  const angle = (imageObjectProps && imageObjectProps.angle) || 0

  return (
    <Box css={position('relative')}>
      <Absolute
        top={0}
        left={0}
        zIndex={100}
        width={'442px'}
        css={{
          height: '333px',
          paddingTop: '0.5px',
          paddingLeft: '0.5px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            borderRadius: rem(12),
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <canvas
            style={{
              background: 'transparent',
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: `rotate(${angle}deg)`,
            }}
            ref={canvasRef}
            onMouseMove={e => handleMouseMove(e)}
          ></canvas>
        </div>
      </Absolute>
    </Box>
  )
}

ImageEraseEditor.propTypes = {
  url: PropTypes.string,
  onChange: PropTypes.func,
}

export function ApplyChangesBottomPanel({label, onDone, onCancel}) {
  const {t} = useTranslation()
  return (
    <Flex
      justify="space-between"
      align="center"
      css={{
        marginTop: rem(10),
        paddingLeft: rem(20),
        paddingRight: rem(20),
      }}
    >
      {label}
      <Flex align="center">
        <IconButton onClick={() => onCancel()}>{t('Cancel')}</IconButton>

        <Divider vertical />

        <IconButton
          style={{fontWeight: theme.fontWeights.bold}}
          onClick={() => onDone()}
        >
          {t('Done')}
        </IconButton>
      </Flex>
    </Flex>
  )
}

ApplyChangesBottomPanel.propTypes = {
  label: PropTypes.string,
  onDone: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}
