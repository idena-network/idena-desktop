import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {transparentize, cover, backgrounds} from 'polished'
import Router from 'next/router'
import theme, {rem} from '../theme'
import useClickOutside from '../hooks/use-click-outside'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import {SubHeading, Text} from './typo'
import Flex from './flex'
import Button, {FlatButton} from './button'
import Box from './box'
import {Absolute} from './position'

export function GlobalModals() {
  const {showExternalUpdateModal} = useAutoUpdateState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()

  return (
    <>
      <Modal
        show={showExternalUpdateModal}
        onHide={() => {
          hideExternalNodeUpdateModal()
        }}
      >
        <Box m="0 0 18px">
          <SubHeading>Cannot update remote node</SubHeading>
          <Text>
            Please, run built-in at the{' '}
            <FlatButton
              color={theme.colors.primary}
              onClick={() => {
                hideExternalNodeUpdateModal()
                Router.push('/settings/node')
              }}
            >
              <span>settings</span>
            </FlatButton>{' '}
            page to enjoy automatic updates.
          </Text>
          <Text css={{marginTop: 10}}>
            Otherwise, please update your remote node manually.
          </Text>
        </Box>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button
              onClick={() => {
                hideExternalNodeUpdateModal()
              }}
            >
              Okay, got it
            </Button>
          </Box>
        </Flex>
      </Modal>
    </>
  )
}

function Modal({show, showCloseIcon = true, width = 360, onHide, ...props}) {
  const ref = useRef()

  useClickOutside(ref, () => {
    if (onHide) {
      onHide()
    }
  })

  return show ? (
    <Box
      style={{
        ...backgrounds(transparentize(0.2, theme.colors.black)),
        ...cover(),
        position: 'fixed',
        zIndex: 1300,
      }}
    >
      <div>
        <Box ref={ref} {...props} />
      </div>
      <style jsx>{`
        div {
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${rem(width)};
          padding: ${rem(25)} ${rem(32)} ${rem(32)};
          border-radius: 6px;
          background-color: ${theme.colors.white};
          transform: translate(-50%, -50%);
          z-index: 9;
        }
      `}</style>
      {showCloseIcon && (
        <Absolute top="1em" right="1em" zIndex={2}>
          <FiX
            color={theme.colors.muted}
            fontSize={theme.fontSizes.large}
            onClick={onHide}
            cursor="pointer"
          />
        </Absolute>
      )}
    </Box>
  ) : null
}

Modal.propTypes = {
  show: PropTypes.bool,
  width: PropTypes.number,
  onHide: PropTypes.func,
  showCloseIcon: PropTypes.bool,
}

export default Modal
