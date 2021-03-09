import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {FlipFilter, FlipFilterOption} from '../../screens/flips/components'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'

// eslint-disable-next-line react/prop-types
function SettingsLayout({children}) {
  const router = useRouter()
  const {t} = useTranslation()

  return (
    <Layout skipHardForkScreen>
      <Page>
        <PageTitle>{t('Settings')}</PageTitle>
        <FlipFilter value={router.pathname} onChange={router.push}>
          <FlipFilterOption value="/settings/general">
            {t('General')}
          </FlipFilterOption>
          <FlipFilterOption value="/settings/node">
            {t('Node')}
          </FlipFilterOption>
          <FlipFilterOption value="/settings/oracles">
            {t('Oracle voting')}
          </FlipFilterOption>
        </FlipFilter>
        {children}
      </Page>
    </Layout>
  )
}

export default SettingsLayout
