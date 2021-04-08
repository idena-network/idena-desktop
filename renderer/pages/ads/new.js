import React from 'react'
import {Stack, Tabs, TabPanels, TabPanel} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import {useMachine} from '@xstate/react'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {saveAd} from '../../screens/ads/utils'
import {
  AdFooter,
  AdNumberInput,
  AdFormField,
  AdForm,
} from '../../screens/ads/components'
import {editAdMachine} from '../../screens/ads/machines'
import {PrimaryButton} from '../../shared/components/button'
import {
  FlipFilter as FilterList,
  FlipFilterOption as FilterOption,
} from '../../screens/flips/components'
import {SuccessAlert} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'

export default function NewAd() {
  const router = useRouter()

  const {t} = useTranslation()

  const epoch = useEpochState()

  const [current, send] = useMachine(editAdMachine, {
    actions: {
      onSuccess: () => router.push('/ads/list'),
    },
    services: {
      init: () => Promise.resolve(),
      submit: ctx => saveAd(ctx, epoch?.epoch ?? -1),
    },
  })

  const [tab, setTab] = React.useState('options')

  return (
    <Layout style={{flex: 1, display: 'flex'}}>
      <Page mb={12}>
        <PageTitle>New ad</PageTitle>
        <FilterList
          value={tab}
          display="flex"
          alignItems="center"
          onChange={value => {
            setTab(value)
            if (value) send('FILTER', {value})
          }}
        >
          <FilterOption value="options">{t('Parameters')}</FilterOption>
          <FilterOption value="advanced">{t('Publish options')}</FilterOption>
        </FilterList>
        <SuccessAlert minH={8} my={6} alignSelf="stretch">
          You must publish this banner after creating
        </SuccessAlert>
        <Tabs variant="unstyled">
          <TabPanels>
            <TabPanel isSelected={false && tab === 'options'}>
              <AdForm
                onChange={ad => {
                  send('UPDATE', {ad})
                }}
              />
            </TabPanel>
            <TabPanel isSelected={true || tab === 'advanced'}>
              <Stack spacing={6} w="480px">
                <Stack spacing={4} shouldWrapChildren>
                  <AdFormField label="Max burn rate" id="maxBurnRate">
                    <AdNumberInput />
                  </AdFormField>
                  <AdFormField label="Max burn rate" id="minBurnRate">
                    <AdNumberInput />
                  </AdFormField>
                  <AdFormField label="Total banner budget" id="totalBudget">
                    <AdNumberInput />
                  </AdFormField>
                  <AdFormField label="Total burnt" id="totalBurnt">
                    <AdNumberInput isDisabled />
                  </AdFormField>
                </Stack>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <AdFooter>
          <PrimaryButton
            onClick={() => {
              send('SUBMIT')
            }}
            isLoading={current.matches('submitting')}
          >
            Save
          </PrimaryButton>
        </AdFooter>
      </Page>
    </Layout>
  )
}
