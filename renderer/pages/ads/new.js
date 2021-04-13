import React from 'react'
import {Stack, TabPanel, TabPanels} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import {useMachine} from '@xstate/react'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {createAdDb} from '../../screens/ads/utils'
import {
  AdFooter,
  AdNumberInput,
  AdFormField,
} from '../../screens/ads/components'
import {editAdMachine} from '../../screens/ads/machines'
import {PrimaryButton} from '../../shared/components/button'
import {
  SimpleTabFilterList,
  SuccessAlert,
  TabFilters,
} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {AdForm} from '../../screens/ads/containers'

export default function NewAdPage() {
  const router = useRouter()

  const {t} = useTranslation()

  const epoch = useEpochState()

  const db = createAdDb(epoch?.epoch ?? -1)

  const [current, send] = useMachine(editAdMachine, {
    actions: {
      onSuccess: () => router.push('/ads/list'),
    },
    services: {
      init: () => Promise.resolve(),
      submit: ctx => db.put(ctx),
    },
  })

  return (
    <Layout style={{flex: 1, display: 'flex'}}>
      <Page mb={12}>
        <PageTitle>New ad</PageTitle>
        <TabFilters spacing={6}>
          <SimpleTabFilterList
            filters={[t('Parameters'), t('Publish options')]}
          />
          <SuccessAlert>
            You must publish this banner after creating
          </SuccessAlert>
          <TabPanels>
            <TabPanel>
              <AdForm
                onChange={ad => {
                  send('UPDATE', {ad})
                }}
              />
            </TabPanel>
            <TabPanel>
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
        </TabFilters>
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
