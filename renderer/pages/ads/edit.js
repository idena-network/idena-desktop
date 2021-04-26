import React from 'react'
import {
  Stack,
  TabPanels,
  TabPanel,
  CloseButton,
  Flex,
  useToast,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {PrimaryButton} from '../../shared/components/button'
import {buildProfile, createAdDb} from '../../screens/ads/utils'
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
  Toast,
} from '../../shared/components/components'
import {callRpc, eitherState} from '../../shared/utils/utils'
import {AdForm} from '../../screens/ads/containers'
import {AdStatus} from '../../shared/types'
import {objectToHex} from '../../screens/oracles/utils'

export default function EditAdPage() {
  const {t} = useTranslation()

  const router = useRouter()
  const {id} = router.query

  const toast = useToast()

  const epoch = useEpochState()

  const db = createAdDb(epoch?.epoch ?? -1)

  const [current, send] = useMachine(editAdMachine, {
    context: {id},
    actions: {
      onSuccess: () => {
        router.push('/ads/list')
      },
      onSavedBeforeClose: () => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => <Toast title={t('Ad has been saved to drafts')} />,
        })
        router.push('/ads/list')
      },
    },
    services: {
      // eslint-disable-next-line no-shadow
      init: ({id}) => db.get(id),
      submit: async context => {
        await db.put({...context, status: AdStatus.Active})
        await callRpc('dna_changeProfile', {
          info: `0x${objectToHex(
            // eslint-disable-next-line no-unused-vars
            buildProfile({ads: (await db.all()).map(({cover, ...ad}) => ad)})
          )}`,
        })
      },
      saveBeforeClose: context => {
        const {status = AdStatus.Draft} = context
        if (status === AdStatus.Draft) return db.put({...context, status})
        return Promise.resolve()
      },
    },
  })

  return (
    <Layout style={{flex: 1, display: 'flex'}}>
      <Page mb={12}>
        <Flex justify="space-between" align="center" alignSelf="stretch" mb={4}>
          <PageTitle mb={0}>Edit ad</PageTitle>
          <CloseButton
            onClick={() => {
              send('CLOSE')
            }}
          />
        </Flex>
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
