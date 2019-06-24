import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Box, FormGroup, Label, Input, Button} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {
  useInviteState,
  useInviteDispatch,
} from '../../../shared/providers/invite-context'
import {useIdentityState} from '../../../shared/providers/identity-context'

export function ActivateInviteForm({onFail}) {
  const keyRef = useRef()

  const {activationCode, activationTx} = useInviteState()
  const {activateInvite} = useInviteDispatch()

  const {canActivateInvite} = useIdentityState()

  if (!canActivateInvite) {
    return null
  }

  return (
    <Box py={theme.spacings.normal}>
      <FormGroup>
        <Label htmlFor="activateInviteKey">Invitation code</Label>
        <Flex align="center">
          <Input
            ref={keyRef}
            id="activateInviteKey"
            defaultValue={activationCode}
            disabled={!!activationCode || !!activationTx}
            style={{...margin(0, theme.spacings.normal, 0, 0), width: rem(400)}}
          />
          <Button
            disabled={!!activationCode || !!activationTx}
            onClick={async () => {
              try {
                await activateInvite(keyRef.current.value)
              } catch (error) {
                if (onFail) {
                  onFail(error)
                }
              }
            }}
          >
            {activationCode ? 'Mining...' : 'Activate invite'}
          </Button>
        </Flex>
      </FormGroup>
    </Box>
  )
}

ActivateInviteForm.propTypes = {
  onFail: PropTypes.func,
}

export default ActivateInviteForm
