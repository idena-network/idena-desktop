import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'
import {useIdentityState} from '../../../shared/providers/identity-context'
import {mapToFriendlyStatus} from '../../../shared/utils/useIdentity'

function NetProfile() {
  const {address, state, stake, age} = useIdentityState()
  return (
    <Box
      bg={theme.colors.gray}
      p={theme.spacings.xlarge}
      css={{
        borderRadius: rem(10),
        ...margin(0, 0, rem(theme.spacings.medium24), 0),
      }}
    >
      <Figure label="Address" value={address} />
      <Figure label="Status" value={mapToFriendlyStatus(state)} />
      <Figure label="Stake" value={stake} postfix="DNA" />
      <Figure label="Age" value={age} postfix="epochs" />
    </Box>
  )
}

export default NetProfile
