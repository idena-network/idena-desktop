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
import {
  useSettingsState,
  useSettingsDispatch,
} from '../providers/settings-context'

export function GlobalModals() {
  const {showExternalUpdateModal} = useAutoUpdateState()
  const {transferModal} = useSettingsState()
  const {hideExternalNodeUpdateModal} = useAutoUpdateDispatch()
  const {hideTransferModal, enableInternalNode} = useSettingsDispatch()

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
        show={transferModal}
        onHide={() => {
          hideTransferModal()
        }}
        width={500}
      >
        <Box m="0 0 18px">
          <SubHeading>Run the built-in node</SubHeading>
          <Text css={{marginBottom: 10}}>
            The built-in node will creare a new address. If you want to keep
            your existing address please do the following:
          </Text>
          <Text css={{marginBottom: 10}}>
            1. Deactivate your mider status (if needed) <br />
            2. Export your private key <br />
            3. Run built-in node with a new address <br />
            4. Import your private key (works only with built-in node) <br />
            5. Shutdown your remote node
          </Text>
          <Text>It'll take time to synchronize the built-in node</Text>
          <Text css={{marginTop: 10}}>
            Otherwise, please update your remote node manually.
          </Text>
        </Box>
        <Flex align="center" justify="space-between">
          <Box px="4px">
            <Button
              onClick={() => {
                hideTransferModal()
              }}
            >
              Okay, got it
            </Button>
          </Box>
          <Box px="4px">
            <Button
              variant="default"
              onClick={() => {
                enableInternalNode(true)
                hideTransferModal()
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
    <Fill bg={theme.colors.gray3} zIndex={1}>
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
