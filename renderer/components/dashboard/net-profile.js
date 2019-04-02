import React from 'react'
import PropTypes from 'prop-types'
import {Figure, Box} from '../atoms'
import theme from '../../theme'

export function NetProfile({
  addr,
  balance,
  age,
  state: status,
  onActivateInviteShow,
  allowedToActivateInvite,
}) {
  return (
    <Box bg={theme.colors.gray} p="1em" css={{borderRadius: '4px'}}>
      <Figure label="Address" value={addr} />
      <Figure
        label="Status"
        value={status}
        postfix={
          allowedToActivateInvite ? (
            <button type="button" onClick={onActivateInviteShow}>
              Activate
            </button>
          ) : null
        }
      />
      <Figure label="Stake" value={balance.stake} postfix="DNA" />
      <Figure label="Balance" value={balance.balance} postfix="DNA" />
      <Figure label="Age" value={age} postfix="epochs" />
      <Figure label="Next validation" value={new Date().toLocaleString()} />
    </Box>
  )
}

NetProfile.propTypes = {
  addr: PropTypes.string.isRequired,
  balance: PropTypes.shape({stake: PropTypes.number, balance: PropTypes.number})
    .isRequired,
  age: PropTypes.number,
  state: PropTypes.string,
  allowedToActivateInvite: PropTypes.bool,
  onActivateInviteShow: PropTypes.func,
}

export default NetProfile
