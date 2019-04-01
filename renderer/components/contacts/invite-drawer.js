import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {Box} from '../atoms/box'
import {Figure, SubHeading, Fill, Absolute, Text} from '../atoms'
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
  inviteData,
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
              onInviteSend(
                addrInputRef.current.value,
                amountInputRef.current.value
              )
            }}
          >
            Send invite
          </Button>
          {inviteData && (
            <Box bg={theme.colors.gray} p="1em" m="1em 0" w={100}>
              <pre>{JSON.stringify(inviteData)}</pre>
            </Box>
          )}
        </Box>
        <Absolute top="1em" right="1em">
          <Text
            color={theme.colors.muted}
            size="1.6em"
            style={{cursor: 'pointer'}}
            onClick={onInviteClose}
          >
            &times;
          </Text>
        </Absolute>
      </Absolute>
      <style jsx>{`
        pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
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
  // eslint-disable-next-line react/forbid-prop-types
  inviteData: PropTypes.object,
}

export default InviteDrawer
