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
          state === 'Newbie' ? (
            <>
              <div>{t('Solve more than 10 flips')}</div>
              <div>{t('to become Verified')}</div>
            </>
          ) : null
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
            tooltip={
              <>
                <div>{t('In order to withdraw the')}</div>
                <div>{t('stake you have to')}</div>
                <div>{t(`terminate your identity`)}</div>
              </>
            }
          />
        </>
      )}

      {penalty > 0 && (
        <Figure
          label={t('Mining penalty')}
          value={penalty}
          postfix="DNA"
          tooltip={
            <>
              <div>{t('Your node was offline more than 1 hour.')}</div>
              <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                {t('The penalty will be charged automaically.')}
              </div>
              <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                {t(`Once it's fully paid you'll continue to mine coins.`)}
              </div>
            </>
          }
        />
      )}
      {age > 0 && <Figure label={t('Age')} value={age} postfix={t('epochs')} />}

      {totalQualifiedFlips > 0 && (
        <>
          <Figure
            label={t('Total score')}
            value={`${totalShortFlipPoints} out of ${totalQualifiedFlips} (${Math.round(
              (totalShortFlipPoints / totalQualifiedFlips) * 10000
            ) / 100}%) `}
            tooltip={
              <>
                <div>{t('Total score for')}</div>
                <div>{t('all validations')}</div>
              </>
            }
          />
        </>
      )}
    </Box>
  )
}

export default NetProfile
