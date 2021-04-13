import React from 'react'
import {Stack, Tabs, TabPanels, TabPanel} from '@chakra-ui/core'
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
import {
  FlipFilter as FilterList,
  FlipFilterOption as FilterOption,
} from '../../screens/flips/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {SuccessAlert} from '../../shared/components/components'
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

  const [tab, setTab] = React.useState(0)

  return (
    <Layout style={{flex: 1, display: 'flex'}}>
      <Page mb={12}>
        <PageTitle>Edit ad</PageTitle>
        <FilterList
          value={tab}
          display="flex"
          alignItems="center"
          onChange={value => {
            setTab(value)
            if (value) send('FILTER', {value})
          }}
        >
          <FilterOption value={0}>{t('Parameters')}</FilterOption>
          <FilterOption value={1}>{t('Publish options')}</FilterOption>
        </FilterList>
        <SuccessAlert flexShrink={0} my={6} alignSelf="stretch">
          You must publish this banner after creating
        </SuccessAlert>
        <Tabs variant="unstyled" index={tab} onChange={setTab}>
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
        </Tabs>
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
