import React from 'react'
import {margin, rem} from 'polished'
import {useTranslation} from 'react-i18next'

import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'
import {Figure} from '../../../shared/components/utils'
import {
  useIdentityState,
  mapToFriendlyStatus,
} from '../../../shared/providers/identity-context'

export function NetProfile() {
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
  const {t} = useTranslation()
  return (
    <Box
      bg={theme.colors.gray}
      p={theme.spacings.xlarge}
      css={{
        borderRadius: rem(10),
        ...margin(0, 0, rem(theme.spacings.medium24), 0),
      }}
    >
      <Figure label={t('Address')} value={address} />
      <Figure
        label={t('Status')}
        value={mapToFriendlyStatus(state)}
        tooltip={
          state === 'Newbie'
            ? t('Solve more than 10 flips&#10;to become Verified')
            : null
        }
      />

      {balance > 0 && (
        <>
          <Figure
            label={t('Balance')}
            value={balance}
            postfix="DNA"
            tooltip={t('Main wallet balance')}
          />
        </>
      )}

      {stake > 0 && (
        <>
          <Figure
            label={t('Stake')}
            value={stake}
            postfix="DNA"
            tooltip={t(
              'In order to withdraw the&#10;stake you have to&#10;terminate your identity'
            )}
          />
        </>
      )}

      {penalty > 0 && (
        <Figure
          label={t('Mining penalty')}
          value={penalty}
          postfix="DNA"
          tooltip={t(
            "Your node was offline more than 1 hour.&#10;The penalty will be charged automaically.&#10;Once it's fully paid you'll continue to mine coins."
          )}
        />
      )}
      {age > 0 && <Figure label="Age" value={age} postfix={t('epochs')} />}

      {totalQualifiedFlips > 0 && (
        <>
          <Figure
            label={t('Total score')}
            value={`${totalShortFlipPoints} out of ${totalQualifiedFlips} (${Math.round(
              (totalShortFlipPoints / totalQualifiedFlips) * 10000
            ) / 100}%) `}
            tooltip={t('Total score for&#10;all validations')}
          />
        </>
      )}
    </Box>
  )
}

export default NetProfile
