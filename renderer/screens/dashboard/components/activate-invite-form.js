import React from 'react'
import {Box, FormControl, Stack} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {PrimaryButton} from '../../../shared/components/button'
import {FormLabel, Input} from '../../../shared/components/components'
import {
  IdentityStatus,
  useIdentityState,
} from '../../../shared/providers/identity-context'
import {
  useInviteDispatch,
  useInviteState,
} from '../../../shared/providers/invite-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function ActivateInviteForm() {
  const {t} = useTranslation()

  const {addError} = useNotificationDispatch()

  const {activationTx} = useInviteState()
  const {activateInvite} = useInviteDispatch()

  const {canActivateInvite, state: status} = useIdentityState()

  if (!canActivateInvite) {
    return null
  }

  const mining = !!activationTx

  return (
    <Box
      as="form"
      onSubmit={async e => {
        e.preventDefault()

        try {
          await activateInvite(e.target.elements.code.value)
        } catch ({message}) {
          addError({
            title: message,
          })
        }
      }}
    >
      <Stack isInline spacing={2} align="flex-end">
        <FormControl justifySelf="stretch" flex={1}>
          <FormLabel htmlFor="code">{t('Invitation code')}</FormLabel>
          <Input
            id="code"
            isDisabled={mining || status === IdentityStatus.Invite}
            _disabled={{
              bg: 'gray.50',
            }}
          />
        </FormControl>
        <PrimaryButton isDisabled={mining} type="submit">
          {mining ? t('Mining...') : t('Activate invite')}
        </PrimaryButton>
      </Stack>
    </Box>
  )
}

export default ActivateInviteForm
