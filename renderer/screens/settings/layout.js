/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {HStack} from '@chakra-ui/react'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../shared/components/components'
import {SettingsNavLink} from './components'

export default function SettingsLayout({children}) {
  const router = useRouter()
  const {t} = useTranslation()

  return (
    <Layout skipHardForkScreen>
      <Page>
        <PageTitle>{t('Settings')}</PageTitle>
        <HStack value={router.pathname} onChange={router.push}>
          <SettingsNavLink href="/settings/general">
            {t('General')}
          </SettingsNavLink>
          <SettingsNavLink href="/settings/node">{t('Node')}</SettingsNavLink>
          <SettingsNavLink href="/settings/advanced">
            {t('Advanced')}
          </SettingsNavLink>
        </HStack>
        {children}
      </Page>
    </Layout>
  )
}
