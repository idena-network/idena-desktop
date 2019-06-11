import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Box, FormGroup, Label, Input, Button} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'

export function ActivateInviteForm({onActivate}) {
  const keyInputRef = useRef()

  return (
    <Box my={theme.spacings.normal} py={theme.spacings.normal}>
      <FormGroup>
        <Label htmlFor="activateInviteKey">Invitation code</Label>
        <Flex align="center">
          <Input
            ref={keyInputRef}
            id="activateInviteKey"
            style={{...margin(0, theme.spacings.normal, 0, 0), width: rem(400)}}
          />
          <Button
            onClick={() => {
              onActivate(keyInputRef.current.value)
            }}
          >
            Activate invite
          </Button>
        </Flex>
      </FormGroup>
    </Box>
  )
}

ActivateInviteForm.propTypes = {
  onActivate: PropTypes.func,
}

export default ActivateInviteForm
