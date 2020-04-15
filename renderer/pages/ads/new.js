import React from 'react'
import {
  FormLabel,
  Input,
  Stack,
  Box,
  Textarea,
  Select,
  NumberInput,
  TabList,
  Tabs,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  Image,
  Icon,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {AVAILABLE_LANGS} from '../../i18n'
import {adsMachine} from '../../screens/ads/machine'
import {PrimaryButton, IconButton} from '../../shared/components'
import {persistState} from '../../shared/utils/persist'
import {
  loadAds,
  validImageType,
  COUNTRY_CODES,
  toDataURL,
} from '../../screens/ads/utils'
import {
  AdFooter,
  AdNumberInput,
  AdFormControl,
  FormSection,
  FormSectionTitle,
  AdFormTab,
} from '../../screens/ads/components'
import {rem} from '../../shared/theme'

export default function NewAd() {
  const router = useRouter()

  const memoConfig = React.useMemo(
    () => [
      {
        actions: {
          persist: ({ads}) =>
            persistState(
              'ads',
              ads.map(({ref, ...ad}) => ({...ad}))
            ),
        },
      },
      {
        newAd: {},
        ads: loadAds(),
      },
    ],
    []
  )

  const [current, send] = useMachine(adsMachine.withConfig(...memoConfig))
  const {
    context: {newAd},
  } = current

  const handleChangeCover = async ({
    target: {
      files: [file],
    },
  }) => {
    if (file && validImageType(file)) {
      send('NEW_AD.CHANGE', {
        cover: await toDataURL(file),
      })
    }
  }

  return (
    <Layout>
      <Page minH="100vh" position="relative">
        <PageTitle>New ad</PageTitle>
        <Tabs variant="unstyled">
          <TabList>
            <AdFormTab>Parameters</AdFormTab>
            <AdFormTab isDisabled>Publish options</AdFormTab>
          </TabList>
          <Alert
            my={6}
            variant="subtle"
            status="success"
            border="1px"
            borderColor="green.200"
            fontWeight={500}
            rounded="md"
          >
            <AlertIcon size="20px" name="info" />
            You must publish this banner after editing.
          </Alert>
          <TabPanels>
            <TabPanel>
              <Stack spacing={6} w="480px">
                <FormSection>
                  <FormSectionTitle>Parameters</FormSectionTitle>
                  <Stack isInline spacing={10}>
                    <Stack spacing={4} shouldWrapChildren>
                      <AdFormControl label="Text" id="text">
                        <Textarea
                          onChange={e =>
                            send('NEW_AD.CHANGE', {title: e.target.value})
                          }
                        />
                      </AdFormControl>
                      <AdFormControl label="Link" id="link">
                        <Input
                          onChange={e =>
                            send('NEW_AD.CHANGE', {url: e.target.value})
                          }
                        />
                      </AdFormControl>
                    </Stack>
                    <Stack spacing={4} alignItems="flex-start">
                      {newAd.cover ? (
                        <Image src={newAd.cover} size={rem(80)} rounded="lg" />
                      ) : (
                        <Box
                          bg="gray.50"
                          borderWidth="1px"
                          p={rem(19)}
                          rounded="lg"
                        >
                          <Icon name="pic" size={rem(40)} color="#d2d4d9" />
                        </Box>
                      )}
                      <IconButton
                        as={FormLabel}
                        htmlFor="cover"
                        type="file"
                        icon="laptop"
                      >
                        Upload cover
                      </IconButton>
                      <Input
                        id="cover"
                        type="file"
                        accept="image/*"
                        opacity={0}
                        zIndex={-1}
                        onChange={handleChangeCover}
                      />
                    </Stack>
                  </Stack>
                </FormSection>
                <FormSection>
                  <FormSectionTitle>Targeting conditions</FormSectionTitle>
                  <Stack spacing={4} shouldWrapChildren>
                    <AdFormControl label="Location" id="location">
                      <Select
                        onChange={e =>
                          send('NEW_AD.CHANGE', {location: e.target.value})
                        }
                      >
                        <option></option>
                        {Object.values(COUNTRY_CODES).map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </Select>
                    </AdFormControl>
                    <AdFormControl label="Language" id="lang">
                      <Select
                        onChange={e =>
                          send('NEW_AD.CHANGE', {lang: e.target.value})
                        }
                      >
                        <option></option>
                        {AVAILABLE_LANGS.map(l => (
                          <option key={l}>{l}</option>
                        ))}
                      </Select>
                    </AdFormControl>
                    <AdFormControl label="Age" id="age">
                      <NumberInput
                        onChange={value => send('NEW_AD.CHANGE', {age: value})}
                      />
                    </AdFormControl>
                    <AdFormControl label="OS" id="os">
                      <Select
                        onChange={e =>
                          send('NEW_AD.CHANGE', {os: e.target.value})
                        }
                      >
                        <option></option>
                        <option>macOS</option>
                        <option>Windows</option>
                        <option>Linux</option>
                      </Select>
                    </AdFormControl>
                  </Stack>
                </FormSection>
              </Stack>
            </TabPanel>
            <TabPanel>
              <Stack spacing={6} w="480px">
                <Stack spacing={4} shouldWrapChildren>
                  <AdFormControl label="Max burn rate" id="maxBurnRate">
                    <AdNumberInput addon="DNA" />
                  </AdFormControl>
                  <AdFormControl label="Max burn rate" id="minBurnRate">
                    <AdNumberInput addon="DNA" />
                  </AdFormControl>
                  <AdFormControl label="Total banner budget" id="totalBudget">
                    <AdNumberInput addon="DNA" />
                  </AdFormControl>
                  <AdFormControl label="Total burnt" id="totalBurnt">
                    <AdNumberInput addon="DNA" isDisabled />
                  </AdFormControl>
                </Stack>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <AdFooter>
          <PrimaryButton
            onClick={() => {
              send('NEW_AD.COMMIT')
              router.push('/ads/list')
            }}
          >
            Save
          </PrimaryButton>
        </AdFooter>
      </Page>
    </Layout>
  )
}
