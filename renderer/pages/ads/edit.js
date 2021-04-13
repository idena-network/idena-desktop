import React from 'react'
import {Stack, TabPanels, TabPanel} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {PrimaryButton} from '../../shared/components/button'
import {createAdDb} from '../../screens/ads/utils'
import {
  AdFooter,
  AdNumberInput,
  AdFormField,
} from '../../screens/ads/components'
import {editAdMachine} from '../../screens/ads/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {
  SimpleTabFilterList,
  SuccessAlert,
  TabFilters,
} from '../../shared/components/components'
import {eitherState} from '../../shared/utils/utils'
import {AdForm} from '../../screens/ads/containers'

export default function EditAdPage() {
  const {t} = useTranslation()

  const router = useRouter()
  const {id} = router.query

  const epoch = useEpochState()

  const db = createAdDb(epoch?.epoch ?? -1)

  const [current, send] = useMachine(editAdMachine, {
    context: {id},
    actions: {
      onSuccess: () => router.push('/ads/list'),
    },
    services: {
      // eslint-disable-next-line no-shadow
      init: ({id}) => db.get(id),
      submit: ctx => db.put(ctx),
    },
  })

  return (
    <Layout style={{flex: 1, display: 'flex'}}>
      <Page mb={12}>
        <PageTitle>Edit ad</PageTitle>
        <TabFilters spacing={6}>
          <SimpleTabFilterList
            filters={[t('Parameters'), t('Publish options')]}
          />
          <SuccessAlert>
            You must publish this banner after creating
          </SuccessAlert>
          <TabPanels>
            <TabPanel>
              {eitherState(current, 'editing') && (
                <AdForm
                  {...current.context}
                  onChange={ad => {
                    send('UPDATE', {ad})
                  }}
                />
              )}
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
            onClick={() => send('SUBMIT')}
            isLoading={current.matches('submitting')}
          >
            Save
          </PrimaryButton>
        </AdFooter>
      </Page>
    </Layout>
  )
}
