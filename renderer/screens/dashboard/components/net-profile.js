import React from 'react'
import {margin, rem} from 'polished'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'
import {
  useIdentityState,
  mapToFriendlyStatus,
} from '../../../shared/providers/identity-context'

function NetProfile() {
  const {address, state, stake, age, totalQualifiedFlips, totalShortFlipPoints} = useIdentityState()
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

      { stake>0 && (
        <>
          <Figure label="Stake" value={stake} postfix="DNA" tooltip="Frozen coins"/>
        </>
      )}

      <Figure label="Age" value={age} postfix="epochs" />

      { totalQualifiedFlips>0 && ( 
        <>
          <Figure label="Total flips score" value={totalShortFlipPoints+' out of '+totalQualifiedFlips +' ('+ Math.round( totalShortFlipPoints/totalQualifiedFlips * 10000 )/100 +'%) ' } postfix="" />
        </>  
      )}

    </Box>
  )
}



export default NetProfile
