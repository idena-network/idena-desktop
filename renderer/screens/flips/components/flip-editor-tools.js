/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {useRef, useCallback, useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {rem, position} from 'polished'
import {FaCircle} from 'react-icons/fa'
import {FiCircle} from 'react-icons/fi'

import {useTranslation} from 'react-i18next'
import {
  Stack,
  Flex as ChakraFlex,
  Box as ChakraBox,
  Icon,
  useColorMode,
} from '@chakra-ui/core'
import useClickOutside from '../../../shared/hooks/use-click-outside'
import {Menu, MenuItem} from '../../../shared/components/menu'

import {IconButton} from '../../../shared/components/button'
import {Box, Absolute} from '../../../shared/components'
import Divider from '../../../shared/components/divider'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

export function Brushes({brush, onChange}) {
  const brushes = [4, 12, 20, 28, 36]
  const {colorMode} = useColorMode()
  return (
    <Stack spacing={2} align="center">
      {brushes.map((b, i) => (
        <ChakraFlex
          key={b}
          align="center"
          justify="center"
          bg={brush === b ? theme.colors[colorMode].gray : 'unset'}
          rounded="md"
          size={6}
          onClick={() => onChange(b)}
        >
          <ChakraBox
            key={b}
            bg={theme.colors[colorMode].text}
            rounded="full"
            size={rem((i + 1) * 2)}
          />
        </ChakraFlex>
      ))}
    </Stack>
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
  const {colorMode} = useColorMode()

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
                          colorMode === 'light' ? (
                            <FiCircle color={showColor} style={circleStyle} />
                          ) : (
                            <FaCircle color="ffffff" style={circleStyle} />
                          )
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
                    minWidth: '75px',
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
                    left: rem(16),
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
                    left: '-58px',
                    top: '-25px',
                    minWidth: rem(52, theme.fontSizes.base),
                    width: rem(52, theme.fontSizes.base),
                    color: `${theme.colors.muted}`,
                    fontWeight: `${theme.fontWeights.normal}`,
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
                  icon={<Icon name="copy" size={5} />}
                >
                  {`${t('Copy')} (${global.isMac ? 'Cmd+C' : 'Ctrl+C'})`}
                </MenuItem>

                <MenuItem
                  disabled={!onPaste}
                  onClick={() => {
                    onPaste()
                    onClose()
                  }}
                  icon={<Icon name="clipboard" size={5} />}
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

                <MenuItem
                  disabled={!onDelete}
                  onClick={() => {
                    onDelete()
                    onClose()
                  }}
                  danger
                  icon={<Icon name="delete" size={5} color="red.500" />}
                >
                  {`${t('Delete')} `}
                </MenuItem>

                {onClear && (
                  <MenuItem
                    onClick={() => {
                      onClear()
                      onClose()
                    }}
                    icon={
                      <Icon
                        name="flip-editor-delete"
                        size={5}
                        color="red.500"
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
  const canvasRef = useRef()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    if (isDone && onDone) {
      if (canvasRef.current) {
        onDone(canvasRef.current.toDataURL())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone])

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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvasRef, isMouseDown]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef])

  const left =
    imageObjectProps &&
    imageObjectProps.x -
      (imageObjectProps.width * imageObjectProps.scaleX) / 2 +
      1
  const top =
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
        width="442px"
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
              left: `${left}px`,
              top: `${top}px`,
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
  brushWidth: PropTypes.number,
  imageObjectProps: PropTypes.object,
  onDone: PropTypes.func,
  onChanging: PropTypes.func,
  isDone: PropTypes.bool,
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
