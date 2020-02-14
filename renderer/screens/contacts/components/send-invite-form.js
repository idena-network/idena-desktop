/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import {padding, rem, margin, wordWrap} from 'polished'
import {FiLoader} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {
  Box,
  SubHeading,
  FormGroup,
  Field,
  Button,
} from '../../../shared/components'
import Avatar from '../../../shared/components/avatar'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function SendInviteForm({onSuccess, onFail}) {
  const {t} = useTranslation()

  const [firstName, setFirstName] = React.useState()
  const [lastName, setLastName] = React.useState()
  const [address] = React.useState()
  const [amount] = React.useState()
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
          {t('Invite new person')}
        </SubHeading>
      </Box>
      <Flex justify="space-between">
        <NameField
          label={t('First name')}
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
        />
        <NameField
          label={t('Last name')}
          value={lastName}
          onChange={e => setLastName(e.target.value)}
        />
      </Flex>
      <FormGroup css={margin(rem(theme.spacings.medium24), 0, 0)}>
        <Button
          disabled={submitting}
          onClick={async () => {
            try {
              setSubmitting(true)
              const invite = await addInvite(
                address,
                amount,
                firstName,
                lastName
              )
              setSubmitting(false)
              if (onSuccess) {
                addNotification({
                  title: t('Invitation code created'),
                })
                onSuccess(invite)
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
          {submitting ? <FiLoader /> : t('Create invitation')}
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

export default SendInviteForm
