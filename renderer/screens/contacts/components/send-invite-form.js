import React from 'react'
import PropTypes from 'prop-types'
import {padding, rem, margin, wordWrap} from 'polished'
import {FiLoader} from 'react-icons/fi'
import {
  Box,
  SubHeading,
  FormGroup,
  Field,
  Hint,
  Button,
} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function SendInviteForm({onSuccess, onFail}) {
  const [firstName, setFirstName] = React.useState()
  const [lastName, setLastName] = React.useState()
  const [address, setAddress] = React.useState()
  const [amount, setAmount] = React.useState()
  const [submitting, setSubmitting] = React.useState(false)

  const {addInvite} = useInviteDispatch()
  const {addNotification, addError} = useNotificationDispatch()

  return (
    <Box
      css={padding(rem(theme.spacings.large48), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={address || `0x${'2'.repeat(64)}`} size={80} />
      </Box>
      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
          textAlign: 'center',
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          Invite for Unknown person
        </SubHeading>
      </Box>
      <Flex justify="space-between">
        <NameField
          label="First name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <NameField
          label="Last name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </Flex>
      <WideField
        label="Address"
        value={address}
        onChange={e => setAddress(e.target.value)}
      />
      <WideField
        label="Amount"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      >
        <Hint label="Fee" value="0.999 DNA" />
        <Hint label="Total amount" value="1000.999 DNA" />
      </WideField>
      <FormGroup css={margin(rem(theme.spacings.medium24), 0, 0)}>
        <Button
          disabled={submitting}
          onClick={async () => {
            try {
              setSubmitting(true)
              await addInvite(address, amount, firstName, lastName)
              setSubmitting(false)
              if (onSuccess) {
                addNotification({
                  title: 'Invite sent',
                })
                onSuccess()
              }
            } catch (error) {
              setSubmitting(false)
              if (onFail) {
                addError({
                  title: error.message,
                })
                onFail(error)
              }
            }
          }}
        >
          {submitting ? <FiLoader /> : 'Send invite'}
        </Button>
      </FormGroup>
    </Box>
  )
}

SendInviteForm.propTypes = {
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
}

const NameField = props => <Field {...props} style={{width: rem(140)}} />
const WideField = props => <Field {...props} style={{width: rem(296)}} />

export default SendInviteForm
