import React, {forwardRef} from 'react'
import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Box,
  Textarea,
  Select,
  NumberInput,
  Flex,
  TabList,
  Tab,
  Tabs,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightAddon,
  NumberInputField,
  Image,
  Icon,
} from '@chakra-ui/core'
import {useMachine, useService} from '@xstate/react'
import {useRouter} from 'next/router'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {AVAILABLE_LANGS} from '../../i18n'
import {adsMachine, adMachine} from '../../screens/ads/machine'
import {PrimaryButton, IconButton} from '../../shared/components'
import {persistState} from '../../shared/utils/persist'
import {loadAds, validImageType} from '../../screens/ads/utils'

export default function EditAd() {
  const {
    query: {id},
  } = useRouter()

  const [current, send] = useMachine(
    adsMachine.withConfig(
      {
        actions: {
          persist: ({ads}) => persistState('ads', ads),
        },
      },
      {
        ads: loadAds(),
      }
    )
  )

  const {ads} = current.context
  const adRef = ads.find(ad => ad.id === id)

  const [currentAd, sendAd] = useService(adRef.ref)
  const {title, cover, url, location, lang, age, os} = currentAd.context

  const handleChangeCover = ({target: {files}}) => {
    const [file] = files
    if (file && validImageType(file)) {
      sendAd('CHANGE', {
        cover: URL.createObjectURL(file),
      })
    }
  }

  return (
    <Layout>
      <Page minH="100vh" position="relative">
        <PageTitle>Edit ad</PageTitle>
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
            You must re-publish this banner after editing.
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
                          value={title}
                          onChange={e =>
                            send('CHANGE', {title: e.target.value})
                          }
                        />
                      </AdFormControl>
                      <AdFormControl label="Link" id="link">
                        <Input
                          value={url}
                          onChange={e => send('CHANGE', {url: e.target.value})}
                        />
                      </AdFormControl>
                    </Stack>
                    <Stack spacing={4} alignItems="flex-start">
                      {cover ? (
                        <Image src={cover} size={20} rounded="lg" />
                      ) : (
                        <Box bg="gray.50" borderWidth="1px" p={5} rounded="lg">
                          <Icon name="pic" size={10} color="#d2d4d9" />
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
                        value={location}
                        onChange={e =>
                          send('CHANGE', {location: e.target.value})
                        }
                      >
                        {['US', 'Canada', 'UK'].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </Select>
                    </AdFormControl>
                    <AdFormControl label="Language" id="lang">
                      <Select
                        value={lang}
                        onChange={e => send('CHANGE', {lang: e.target.value})}
                      >
                        {AVAILABLE_LANGS.map(l => (
                          <option key={l}>{l}</option>
                        ))}
                      </Select>
                    </AdFormControl>
                    <AdFormControl label="Age" id="age">
                      <NumberInput
                        value={age}
                        onChange={value => send('CHANGE', {age: value})}
                      />
                    </AdFormControl>
                    <AdFormControl label="OS" id="os">
                      <Select
                        value={os}
                        onChange={e => send('CHANGE', {os: e.target.value})}
                      >
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
          <PrimaryButton onClick={() => send('NEW_AD.COMMIT')}>
            Save
          </PrimaryButton>
        </AdFooter>
      </Page>
    </Layout>
  )
}

// eslint-disable-next-line react/display-name
const AdFormTab = forwardRef((props, ref) => (
  <Tab
    ref={ref}
    // eslint-disable-next-line react/prop-types
    isSelected={props.isSelected}
    color="muted"
    fontWeight={500}
    py={2}
    px={4}
    rounded="md"
    _selected={{bg: 'brandBlue.50', color: 'brandBlue.500'}}
    {...props}
  />
))

// eslint-disable-next-line react/prop-types
function FormSection(props) {
  return <Box {...props} />
}

function FormSectionTitle(props) {
  return (
    <Heading
      as="h3"
      py="10px"
      mb={2}
      fontSize="14px"
      fontWeight={500}
      {...props}
    />
  )
}

// eslint-disable-next-line react/prop-types
export function AdFormControl({label, id, children}) {
  return (
    <FormControl>
      <Flex align="center">
        <FormLabel htmlFor={id} color="muted" w="120px">
          {label}
        </FormLabel>
        <Box width="360px">{React.cloneElement(children, {id})}</Box>
      </Flex>
    </FormControl>
  )
}

// eslint-disable-next-line react/prop-types
function AdNumberInput({addon, ...props}) {
  return (
    <InputGroup>
      <NumberInput flex={1} {...props}>
        <NumberInputField
          inputMode="numeric"
          pattern="[0-9]*"
          flex={1}
          roundedRight={0}
        />
      </NumberInput>
      <InputRightAddon bg="gray.50">{addon}</InputRightAddon>
    </InputGroup>
  )
}

function AdFooter(props) {
  return (
    <Box
      borderTop="1px"
      borderTopColor="gray.300"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      px={4}
      py={3}
    >
      <Stack isInline spacing={2} justify="flex-end" {...props} />
    </Box>
  )
}
