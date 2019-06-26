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
import Pre from '../../../shared/components/pre'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import Avatar from '../../flips/shared/components/avatar'

export function SendInviteForm({addr, amount, onFail}) {
  const addRef = useRef(null)
  const amountRef = useRef(null)

  const [result, setResult] = React.useState()

  const {addInvite, getLastInvite} = useInviteDispatch()

  return (
    <Box p="2em">
      <Avatar username={addr} />
      <Box m="0 0 2em">
        <SubHeading>Invite Unknown person</SubHeading>
      </Box>
      <FormGroup>
        <Label htmlFor="addr">Address</Label>
        <Input defaultValue={addr} ref={addRef} id="addr" />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="amount">Amount</Label>
        <Input defaultValue={amount} ref={amountRef} id="amount" />
      </FormGroup>
      <Button
        onClick={async () => {
          try {
            await addInvite(addRef.current.value, addRef.current.value)
            setResult(JSON.stringify(getLastInvite()))
          } catch (error) {
            if (onFail) {
              onFail(error)
            }
          }
        }}
      >
        Send invite
      </Button>
      {result && <Pre>{result}</Pre>}
    </Box>
  )
}

SendInviteForm.propTypes = {
  addr: PropTypes.string,
  amount: PropTypes.number,
  onFail: PropTypes.func,
}

export default SendInviteForm
