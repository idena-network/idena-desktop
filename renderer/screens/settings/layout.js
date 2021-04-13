/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import Layout from '../../shared/components/layout'
import {
  Page,
  PageTitle,
  FilterButton,
  FilterButtonList,
} from '../../shared/components/components'

export default function SettingsLayout({children}) {
  const router = useRouter()
  const {t} = useTranslation()

  return (
    <Layout skipHardForkScreen>
      <Page>
        <PageTitle>{t('Settings')}</PageTitle>
        <FilterButtonList value={router.pathname} onChange={router.push}>
          <FilterButton value="/settings/general">{t('General')}</FilterButton>
          <FilterButton value="/settings/node">{t('Node')}</FilterButton>
          <FilterButton value="/settings/advanced">
            {t('Advanced')}
          </FilterButton>
          <FilterButton value="/settings/ads">{t('Ads')}</FilterButton>
        </FilterButtonList>
        {children}
      </Page>
    </Layout>
  )
}
