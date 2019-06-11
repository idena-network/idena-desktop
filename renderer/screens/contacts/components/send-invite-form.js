import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  SubHeading,
  Button,
  FormGroup,
  Label,
  Input,
} from '../../../shared/components'
import Avatar from './contact-avatar'
import theme from '../../../shared/theme'
import {Figure} from '../../../shared/components/utils'

export function SendInviteForm({addr, amount, available, onSend}) {
  const addrInputRef = useRef(null)
  const amountInputRef = useRef(null)
  return (
    <Box p="2em">
      <Avatar name="optimusway" size={4} />
      <Box m="0 0 2em">
        <SubHeading>Invite Unknown person</SubHeading>
      </Box>
      <FormGroup>
        <Label htmlFor="addr">Address</Label>
        <Input defaultValue={addr} ref={addrInputRef} id="addr" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="amount">Amount</Label>
        <Input defaultValue={amount} ref={amountInputRef} id="amount" />
      </FormGroup>
      <Figure label="Available" value={available} />
      <Button
        onClick={() => {
          onSend(addrInputRef.current.value, amountInputRef.current.value)
        }}
      >
        Send invite
      </Button>
      )}
    </Box>
  )
}

SendInviteForm.propTypes = {
  addr: PropTypes.string,
  amount: PropTypes.number,
  available: PropTypes.number,
  onSend: PropTypes.func.isRequired,
}

export default SendInviteForm
