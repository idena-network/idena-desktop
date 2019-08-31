import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, margin} from 'polished'
import {FiSend, FiDollarSign, FiSlash} from 'react-icons/fi'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'

import Actions from '../../../shared/components/actions'
import IconLink from '../../../shared/components/icon-link'

function ContactToolbar({onRename, onKill, onSendCoins}) {
  return (
    <Box
      py={theme.spacings.large}
      w={rem(700)}
      css={{
        ...padding(rem(theme.spacings.small8), 0),
        ...margin(rem(theme.spacings.medium16), 0),
      }}
    >
      <Actions>
        <IconLink disabled icon={<FiSend />}>
          Send message
        </IconLink>
        <IconLink disabled icon={<FiDollarSign />}>
          Send coins
        </IconLink>

        <IconLink
          disabled={onKill == null}
          icon={<FiSlash />}
          onClick={() => {
            onKill()
          }}
        >
          Kill
        </IconLink>

        <IconLink
          disabled={onRename == null}
          onClick={() => {
            onRename()
          }}
        >
          Rename
        </IconLink>
      </Actions>
    </Box>
  )
}

ContactToolbar.propTypes = {
  onRename: PropTypes.func,
  onRevokeInvitation: PropTypes.func,
  onSendCoins: PropTypes.func,
}

export default ContactToolbar
