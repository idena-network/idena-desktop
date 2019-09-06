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
  const {
    address,
    state,
    stake,
    penalty,
    totalQualifiedFlips,
    totalShortFlipPoints,
  } = useIdentityState()
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

      {state === 'Newbie' && (
        <>
          <Figure
            label="Status"
            value={mapToFriendlyStatus(state)}
            tooltip="Solve more than 10 flips&#10;to become Verified"
          />
        </>
      )}
      {state !== 'Newbie' && (
        <>
          <Figure label="Status" value={mapToFriendlyStatus(state)} />
        </>
      )}

      {stake > 0 && (
        <>
          <Figure
            label="Stake"
            value={stake}
            postfix="DNA"
            tooltip="Frozen coins"
          />
        </>
      )}

      {penalty > 0 && (
        <Figure
          label="Mining penalty"
          value={penalty}
          postfix="DNA"
          tooltip="Your node was offline more that 1 hour.&#10;The penalty will be charged automaically.&#10;Once it's fully paid you'll continue to mine coins."
        />
      )}

      {totalQualifiedFlips > 0 && (
        <>
          <Figure
            label="Total score"
            value={`${totalShortFlipPoints} out of ${totalQualifiedFlips} (${Math.round(
              (totalShortFlipPoints / totalQualifiedFlips) * 10000
            ) / 100}%) `}
            postfix=""
            tooltip="Total score for&#10;all validations"
          />
        </>
      )}
    </Box>
  )
}

export default NetProfile
