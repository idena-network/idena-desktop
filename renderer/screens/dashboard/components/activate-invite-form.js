import React, {useRef} from 'react'
import {margin, rem} from 'polished'
import {useTranslation} from 'react-i18next'

import {Box, FormGroup, Label, Input, Button} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {
  useInviteState,
  useInviteDispatch,
} from '../../../shared/providers/invite-context'
import {
  useIdentityState,
  IdentityStatus,
} from '../../../shared/providers/identity-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

function ActivateInviteForm() {
  const {t} = useTranslation()
  const keyRef = useRef()

  const {addError} = useNotificationDispatch()

  const {activationTx, activationCode} = useInviteState()
  const {activateInvite} = useInviteDispatch()

  const {canActivateInvite, state: status} = useIdentityState()

  if (!canActivateInvite) {
    return null
  }

  const mining = !!activationTx

  return (
    <Box py={theme.spacings.normal}>
      <FormGroup>
        <Label htmlFor="activateInviteKey">{t('Invitation code')}</Label>
        <Flex align="center">
          <Input
            ref={keyRef}
            id="activateInviteKey"
            disabled={mining || status === IdentityStatus.Invite}
            style={{
              ...margin(0, theme.spacings.normal, 0, 0),
              width: rem(400),
            }}
            defaultValue={activationCode}
          />
          <Button
            disabled={mining}
            onClick={async () => {
              try {
                await activateInvite(keyRef.current.value)
              } catch ({message}) {
                addError({
                  title: message,
                })
              }
            }}
          >
            {mining ? t('Mining...') : t('Activate invite')}
          </Button>
        </Flex>
      </FormGroup>
    </Box>
  )
}

export default ActivateInviteForm
