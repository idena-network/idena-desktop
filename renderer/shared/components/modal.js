import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {rem} from 'polished'
import Router from 'next/router'
import theme from '../theme'
import {Box, Fill, Absolute, Button} from '.'
import useClickOutside from '../hooks/use-click-outside'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import {SubHeading, Text} from './typo'
import Flex from './flex'
import {FlatButton} from './button'

export function GlobalModals() {
  const autoUpdate = useAutoUpdateState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()

  return (
    <Modal
      show={autoUpdate.showExternalUpdateModal}
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
  )
}

function Modal({show, showCloseIcon = true, onHide, ...props}) {
  const ref = useRef()

  useClickOutside(ref, () => {
    if (onHide) {
      onHide()
    }
  })

  return show ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <div>
        <Box ref={ref} {...props} />
      </div>
      <style jsx>{`
        div {
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${rem(360)};
          padding: ${rem(25)} ${rem(32)};
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
    </Fill>
  ) : null
}

Modal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  showCloseIcon: PropTypes.bool,
}

export default Modal
