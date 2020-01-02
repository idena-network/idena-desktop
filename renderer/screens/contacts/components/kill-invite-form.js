import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, margin, rem, padding} from 'polished'
import {
  Box,
  Text,
  Button,
  FormGroup,
  SubHeading,
  Field,
} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme from '../../../shared/theme'
import useFullName from '../../../shared/hooks/use-full-name'
import useUsername from '../../../shared/hooks/use-username'

import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function KillInvite({receiver, firstName, lastName, stake, onSuccess, onFail}) {
  const address = receiver
  const username = useUsername({address})
  const fullName = useFullName({firstName, lastName})
  const [to, setTo] = React.useState()
  const [submitting, setSubmitting] = React.useState(false)

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
          Terminate invited identity
        </SubHeading>
        <Text>Terminate invited identity and withdraw its stake.</Text>
      </Box>

      <FormGroup>
        <Field
          disabled
          label="Withraw stake, DNA"
          value={stake}
          type="number"
        />
      </FormGroup>

      <FormGroup>
        <Field
          label="To address"
          value={to}
          onChange={e => setTo(e.target.value)}
        />
      </FormGroup>

      <FormGroup
        css={margin(rem(theme.spacings.medium24), 0, 0)}
        className="text-right"
      >
        <Button
          disabled={submitting || !to}
          danger
          onClick={async () => {
            try {
              setSubmitting(true)
              const {result, error} = await killInvite({from: address, to})
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
  receiver: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  stake: PropTypes.number,
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
}

// const NameField = props => <Field {...props} style={{width: rem(140)}} />

export default KillInvite
