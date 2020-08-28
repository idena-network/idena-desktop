import React from 'react'
import PropTypes from 'prop-types'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {Box, PageTitle} from '../../shared/components'
import theme from '../../shared/theme'
import {FlipFilter, FlipFilterOption} from '../../screens/flips/components'

function SettingsLayout({children}) {
  const router = useRouter()
  const {t} = useTranslation()

  return (
    <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
      <Box>
        <PageTitle>{t('Settings')}</PageTitle>
        <FlipFilter value={router.pathname} onChange={router.push}>
          <FlipFilterOption value="/settings">{t('General')}</FlipFilterOption>
          <FlipFilterOption value="/settings/node">
            {t('Node')}
          </FlipFilterOption>
        </FlipFilter>
      </Box>
      {children}
    </Box>
  )
}

SettingsLayout.propTypes = {
  children: PropTypes.node,
}

export default SettingsLayout
