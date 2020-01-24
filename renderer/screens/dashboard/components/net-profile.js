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
    balance,
    penalty,
    age,
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

      {balance > 0 && (
        <>
          <Figure
            label="Balance"
            value={balance}
            postfix="DNA"
            tooltip="Main wallet balance"
          />
        </>
      )}

      {stake > 0 && (
        <>
          <Figure
            label="Stake"
            value={stake}
            postfix="DNA"
            tooltip="In order to withdraw the&#10;stake you have to&#10;terminate your identity"
          />
        </>
      )}

      {penalty > 0 && (
        <Figure
          label="Mining penalty"
          value={penalty}
          postfix="DNA"
          tooltip="Your node was offline more that 1 hour.&#10;The penalty will be charged automatically.&#10;Once it's fully paid you'll continue to mine coins."
        />
      )}
      {age > 0 && <Figure label="Age" value={age} postfix="epochs" />}

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
