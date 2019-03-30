import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {Box} from '../atoms/box'
import {Figure, SubHeading, Fill, Absolute} from '../atoms'
import {FormGroup, Label, Input} from '../atoms/form'
import {Button} from '../atoms/button'
import Avatar from './contact-avatar'
import theme from '../../theme'

export const InviteDrawer = ({
  show,
  addr,
  amount,
  available,
  onInviteSend,
  onInviteClose,
}) => {
  const addrInputRef = useRef(null)
  const amountInputRef = useRef(null)
  return show ? (
    <Fill bg={theme.colors.gray3} zIndex={1}>
      <Absolute
        bg={theme.colors.white}
        zIndex={2}
        top={0}
        bottom={0}
        right={0}
        w="350px"
      >
        <Box p="2em">
          <Avatar name="optimusway" size={4} />
          <Box m="0 0 2em">
            <SubHeading>Invite Unknown person</SubHeading>
          </Box>
          <FormGroup>
            <Label>Address</Label>
            <Input defaultValue={addr} ref={addrInputRef} />
          </FormGroup>
          <FormGroup>
            <Label>Amount</Label>
            <Input defaultValue={amount} ref={amountInputRef} />
          </FormGroup>
          <Figure label="Available" value={available} />
          <Button
            onClick={() => {
              onInviteSend(
                addrInputRef.current.value,
                amountInputRef.current.value
              )
            }}
          >
            Send invite
          </Button>
          <button type="button" onClick={onInviteClose}>
            Close
          </button>
        </Box>
      </Absolute>
    </Fill>
  ) : null
}

InviteDrawer.propTypes = {
  show: PropTypes.bool,
  addr: PropTypes.string,
  amount: PropTypes.number,
  available: PropTypes.number,
  onInviteSend: PropTypes.func.isRequired,
  onInviteClose: PropTypes.func,
}

export default InviteDrawer
