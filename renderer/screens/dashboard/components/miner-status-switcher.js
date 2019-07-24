import React, {useState} from 'react'
import {
  Box,
  BlockHeading,
  FormGroup,
  Label,
  Switcher,
  Modal,
  Input,
  Button,
  SubHeading,
  Text,
} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'

// eslint-disable-next-line react/prop-types
function MinerStatusSwitcher() {
  const [switcherActive, setSwitcherState] = useState(true)
  const [showModal, setShowModal] = React.useState(false)

  return (
    <Box m="0 0 24px 0">
      <FormGroup onClick={() => setShowModal(!showModal)}>
        <BlockHeading>Status</BlockHeading>
        <div className="form-control">
          <Flex align="center" justify="space-between">
            <Label htmlFor="switcher" style={{margin: 0, cursor: 'pointer'}}>
              Miner
            </Label>
            <Box style={{pointerEvents: 'none'}}>
              <Switcher withStatusHint isChecked={switcherActive} />
            </Box>
          </Flex>
        </div>
        <style jsx>{`
          .form-control {
            border: solid 1px ${theme.colors.gray2};
            color: ${theme.colors.input};
            background: ${theme.colors.white};
            border-radius: 6px;
            font-size: 1em;
            padding: 0.5em 1em 0.65em;
            cursor: pointer;
          }
        `}</style>
      </FormGroup>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false)
        }}
      >
        <Box m="0 0 18px">
          <SubHeading>
            &apos;Miner&apos; mode {!switcherActive ? 'on' : 'off'}
          </SubHeading>
          <Text>
            {!switcherActive ? (
              <span>Switch the node to the &apos;Miner&apos; mode.</span>
            ) : (
              <span>Switch off the &apos;Miner&apos; mode.</span>
            )}
          </Text>
        </Box>
        <form>
          <FormGroup m="0 0 24px">
            <Label htmlFor="fee">Fee, DNA</Label>
            <Input name="fee" value="123" disabled />
          </FormGroup>
        </form>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Box>
          <Box px="4px">
            <Button
              onClick={() => {
                setSwitcherState(!switcherActive)
                setShowModal(false)
              }}
            >
              Submit
            </Button>
          </Box>
        </Flex>
      </Modal>
    </Box>
  )
}

export default MinerStatusSwitcher
