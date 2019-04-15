import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {Box, SubHeading} from '../../shared/components'
import {Figure} from '../atoms'
import {FormGroup, Label, Input} from '../atoms/form'
import {Button} from '../atoms/button'
import Avatar from './contact-avatar'
import theme from '../../theme'

export function SendInviteForm({
  addr,
  amount,
  available,
  inviteResult,
  onInviteSend,
}) {
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
          onInviteSend(addrInputRef.current.value, amountInputRef.current.value)
        }}
      >
        Send invite
      </Button>
      {inviteResult && (
        <Box bg={theme.colors.gray} p="1em" m="1em 0" w={100}>
          <pre>{JSON.stringify(inviteResult)}</pre>
          <style jsx>{`
            pre {
              white-space: pre-wrap;
              word-break: break-word;
            }
          `}</style>
        </Box>
      )}
    </Box>
  )
}

SendInviteForm.propTypes = {
  addr: PropTypes.string,
  amount: PropTypes.number,
  available: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  inviteResult: PropTypes.object,
  onInviteSend: PropTypes.func.isRequired,
}

export default SendInviteForm
