import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {
  useIdentityDispatch,
  useIdentityState,
} from '../../../shared/providers/identity-context'
import {Box, Button, Input, Absolute} from '../../../shared/components'
import theme from '../../../shared/theme'

const WANNA_KILL_MYSELF = false

function KillMe() {
  const [showConfirm, setShowConfirm] = React.useState(false)
  const {killMe} = useIdentityDispatch()

  if (!WANNA_KILL_MYSELF) {
    return null
  }

  return (
    <Box>
      <Button
        variant="primary"
        onClick={() => {
          setShowConfirm(true)
        }}
      >
        Kill me
      </Button>
      <KillMeDialog
        isOpen={showConfirm}
        onConfirm={killMe}
        onCancel={() => {
          setShowConfirm(false)
        }}
      />
    </Box>
  )
}

// eslint-disable-next-line react/prop-types
function KillMeDialog({isOpen, onConfirm, onCancel}) {
  const ref = React.useRef()
  const {address} = useIdentityState()

  return (
    isOpen && (
      <Absolute
        top={0}
        left={0}
        right={0}
        bg="red"
        padding={rem(theme.spacings.medium32)}
      >
        <h2>are you sure??!!1</h2>
        <Input placeholder="type address to confirm" />
        <Button
          variant="primary"
          onClick={() => {
            if (ref.current.value === address) {
              onConfirm()
            }
          }}
        >
          Bump!
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Nah
        </Button>
      </Absolute>
    )
  )
}

KillMeDialog.propTypes = {
  isOpen: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default KillMe
