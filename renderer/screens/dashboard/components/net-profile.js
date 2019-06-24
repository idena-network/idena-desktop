import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'
import {useIdentityState} from '../../../shared/providers/identity-context'

export function NetProfile({stake, age}) {
  const {address, status} = useIdentityState()
  return (
    <Box
      bg={theme.colors.gray}
      p={theme.spacings.xlarge}
      css={{
        borderRadius: '10px',
        ...margin(0, 0, rem(theme.spacings.medium24), 0),
      }}
    >
      <Figure label="Address" value={address} />
      <Figure label="Status" value={status} />
      <Figure label="Stake" value={stake} postfix="DNA" />
      <Figure label="Age" value={age} postfix="epochs" />
    </Box>
  )
}

NetProfile.propTypes = {
  age: PropTypes.number,
  stake: PropTypes.string,
}

export default NetProfile
