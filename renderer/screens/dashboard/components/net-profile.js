import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'

export function NetProfile({address, state, stake, age}) {
  const status = state === 'Undefined' ? 'Not validated' : state
  return (
    <Box
      bg={theme.colors.gray}
      p={theme.spacings.xlarge}
      css={{borderRadius: '10px'}}
    >
      <Figure label="Address" value={address} />
      <Figure label="Status" value={status} />
      <Figure label="Stake" value={stake} postfix="DNA" />
      <Figure label="Age" value={age} postfix="epochs" />
    </Box>
  )
}

NetProfile.propTypes = {
  address: PropTypes.string.isRequired,
  age: PropTypes.number,
  state: PropTypes.string,
  stake: PropTypes.string.isRequired,
}

export default React.memo(NetProfile)
