import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {FiX} from 'react-icons/fi'
import {rem, transparentize} from 'polished'
import Router from 'next/router'
import theme from '../theme'
import useClickOutside from '../hooks/use-click-outside'
import {
  useAutoUpdateState,
  useAutoUpdateDispatch,
} from '../providers/update-context'
import {SubHeading, Text} from './typo'
import Flex from './flex'
import Button, {FlatButton} from './button'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../providers/settings-context'
import Box from './box'
import {Fill, Absolute} from './position'

export function GlobalModals() {
  const {showExternalUpdateModal} = useAutoUpdateState()
  const {showTransferModal} = useSettingsState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()
  const {toggleTransferModal, toggleRunInternalNode} = useSettingsDispatch()

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
      <Modal
        show={showTransferModal}
        onHide={() => {
          toggleTransferModal(false)
        }}
        width={500}
      >
        <Box m="0 0 18px">
          <SubHeading>Run the built-in node</SubHeading>
          <Text css={{marginBottom: 10}}>
            The built-in node will create a new address. If you want to keep
            your existing address please do the following:
          </Text>
          <Text css={{marginBottom: 10}}>
            1. Deactivate your miner status (if needed) <br />
            2. Export your private key on the Settings page <br />
            3. Run the built-in node with a new address <br />
            4. Import your private key on the Settins page <br />
            5. Shutdown your remote node
          </Text>
          <Text>It will take time for the built-in node to synchronize</Text>
        </Box>
        <Flex align="center" justify="space-between">
          <Box px="4px">
            <Button
              onClick={() => {
                toggleTransferModal(false)
              }}
            >
              Okay, got it
            </Button>
          </Box>
          <Box px="4px">
            <Button
              variant="secondary"
              onClick={() => {
                toggleRunInternalNode(true)
                toggleTransferModal(false)
              }}
            >
              Run with a new address
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
    <Fill bg={transparentize(0.2, theme.colors.black)} zIndex={1}>
      <div>
        <Box ref={ref} {...props} />
      </div>
      <style jsx>{`
        div {
          position: absolute;
          left: 50%;
          top: 50%;
          width: ${rem(width)};
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
  width: PropTypes.number,
  onHide: PropTypes.func,
  showCloseIcon: PropTypes.bool,
}

export default Modal
