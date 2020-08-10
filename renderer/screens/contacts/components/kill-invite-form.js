import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, margin, padding} from 'polished'
import {
  Box,
  Button,
  FormGroup,
  SubHeading,
  Field,
} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme, {rem} from '../../../shared/theme'
import useFullName from '../../../shared/hooks/use-full-name'
import useUsername from '../../../shared/hooks/use-username'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'
import {useIdentityState} from '../../../shared/providers/identity-context'

function KillInvite({
  id,
  receiver,
  firstName,
  lastName,
  state,
  stake,
  onSuccess,
  onFail,
}) {
  const inviteeAddress = receiver
  const username = useUsername({address: inviteeAddress})
  const fullName = useFullName({firstName, lastName})
  const [submitting, setSubmitting] = React.useState(false)
  const {address: myAddress} = useIdentityState()

  const {killInvite} = useInviteDispatch()

  const {addNotification, addError} = useNotificationDispatch()

  return (
    <Box
      css={padding(rem(theme.spacings.medium32), rem(theme.spacings.medium32))}
    >
      <Box css={{textAlign: 'center'}}>
        <Avatar username={username} size={80} />
      </Box>

      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, 0),
          textAlign: 'center',
        }}
      >
        <SubHeading
          css={{...margin(0, 0, theme.spacings.small8), ...wordWrap()}}
        >
          {fullName || receiver}
        </SubHeading>
      </Box>

      <Box
        css={{
          ...margin(theme.spacings.medium16, 0, theme.spacings.medium32),
          textAlign: 'center',
        }}
      >
        <SubHeading css={{...margin(0, 0, theme.spacings.small8)}}>
          Terminate invitation
        </SubHeading>
      </Box>

      <FormGroup>
        <Field label="Status" value={state} disabled />
      </FormGroup>

      <FormGroup>
        <Field disabled label="Stake, iDNA" value={stake} type="number" />
      </FormGroup>

      <FormGroup
        css={margin(rem(theme.spacings.medium24), 0, 0)}
        className="text-right"
      >
        <Button
          disabled={submitting}
          danger
          onClick={async () => {
            try {
              setSubmitting(true)
              const {result, error} = await killInvite(
                id,
                myAddress,
                inviteeAddress
              )
              setSubmitting(false)

              if (error) {
                addError({
                  title: 'Error while sending transaction',
                  body: error.message,
                })
              } else {
                addNotification({
                  title: 'Transaction sent',
                  body: result,
                })
                if (onSuccess) onSuccess(result)
              }
            } catch (error) {
              setSubmitting(false)
              if (onFail) {
                addError({
                  title: 'Something went wrong',
                  body: error.message,
                })
                onFail(error)
              }
            }
          }}
        >
          Terminate
        </Button>
      </FormGroup>
    </Box>
  )
}

KillInvite.propTypes = {
  id: PropTypes.string,
  receiver: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  state: PropTypes.string,
  stake: PropTypes.string,
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
}

// const NameField = props => <Field {...props} style={{width: rem(140)}} />

export default KillInvite
