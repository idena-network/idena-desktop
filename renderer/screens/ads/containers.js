/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Badge,
  Box,
  Drawer as ChakraDrawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  FormControl,
  Heading,
  Icon,
  Image,
  Select,
  Stack,
  Stat,
  Text,
  useTheme,
  VisuallyHidden,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {
  IconButton2,
  PrimaryButton,
  SecondaryButton,
} from '../../shared/components/button'
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerHeader,
  ExternalLink,
  FormLabel,
  HDivider,
  IconMenuItem,
  Input,
  Menu,
  SuccessAlert,
  Textarea,
} from '../../shared/components/components'
import {
  callRpc,
  countryCodes,
  toLocaleDna,
  urlFromBytes,
} from '../../shared/utils/utils'
import {DnaInput, FillCenter} from '../oracles/components'
import {
  AdFormField,
  AdInput,
  AdNumberInput,
  AdStatLabel,
  AdStatNumber,
  FormSection,
  FormSectionTitle,
} from './components'
import {Fill} from '../../shared/components'
import {AdStatus} from '../../shared/types'
import {adFormMachine} from './machines'
import {hasImageType} from '../../shared/utils/img'
import {AVAILABLE_LANGS} from '../../i18n'
import {buildTargetKey, createAdDb, isEligibleAd} from './utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {hexToObject} from '../oracles/utils'

export function BlockAdStat({label, value, children, ...props}) {
  return (
    <Stat flex="initial" {...props}>
      {label && <AdStatLabel>{label}</AdStatLabel>}
      {value && <AdStatNumber>{value}</AdStatNumber>}
      {children}
    </Stat>
  )
}

export function InlineAdGroup({labelWidth, children, ...props}) {
  return (
    <Stack {...props}>
      {React.Children.map(children, c => React.cloneElement(c, {labelWidth}))}
    </Stack>
  )
}

export function InlineAdStat({
  label,
  value,
  labelWidth,
  fontSize,
  children,
  ...props
}) {
  return (
    <Stack as={BlockAdStat} isInline {...props}>
      {label && (
        <AdStatLabel fontSize={fontSize} flexBasis={labelWidth}>
          {label}
        </AdStatLabel>
      )}
      {value && <AdStatNumber fontSize={fontSize}>{value}</AdStatNumber>}
      {children}
    </Stack>
  )
}

export function SmallInlineAdStat(props) {
  return <InlineAdStat fontSize="sm" {...props} />
}

export function AdOverlayStatus({status}) {
  const {colors} = useTheme()

  const statusColor = {
    [AdStatus.PartiallyShowing]: 'warning',
    [AdStatus.NotShowing]: 'red',
  }

  const startColor = colors[statusColor[status]]?.['500'] ?? 'transparent'

  return (
    <Fill
      rounded="lg"
      backgroundImage={`linear-gradient(to top, ${startColor}, transparent)`}
    />
  )
}

export function AdBanner({limit = 5, ...props}) {
  const {i18n} = useTranslation()

  const epoch = useEpochState()
  const {address, age, stake} = useIdentityState()

  const [showingAd, setShowingAd] = React.useState()

  React.useEffect(() => {
    if (epoch?.epoch) {
      const targetKey = buildTargetKey({
        locale: i18n.language,
        age,
        stake,
      })

      callRpc('bcn_burntCoins').then(result => {
        if (result) {
          const targetedAds = result.filter(({key}) =>
            isEligibleAd(targetKey, key)
          )

          // eslint-disable-next-line no-shadow
          targetedAds.slice(0, limit).forEach(async ({address}) => {
            const res = await callRpc('dna_profile', address)
            const {ads} = hexToObject(res.info ?? {})
            if (ads?.length > 0) {
              const [ad] = ads
              setShowingAd({
                ...ad,
                ...(await createAdDb(epoch?.epoch).get(ad.id)),
              })
            }
          })
        }
      })
    }
  }, [age, epoch, i18n.language, limit, stake])

  const {
    title = 'Your tagline here',
    cover,
    issuer = address,
    url = 'https://idena.io',
  } = showingAd ?? {}

  return (
    <Flex
      align="center"
      justify="space-between"
      borderBottomWidth={1}
      borderBottomColor="gray.300"
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex="banner"
      {...props}
    >
      <Stack
        isInline
        cursor="pointer"
        onClick={() => {
          global.openExternal(url)
        }}
      >
        <AdCoverImage ad={{cover}} size={10} />
        <Stack spacing={1}>
          <Text color>{title}</Text>
          <Stack isInline spacing={1}>
            <Avatar
              address={issuer}
              size={14}
              borderWidth={1}
              borderColor="gray.016"
              rounded="sm"
            />
            <Text
              color="muted"
              fontSize="sm"
              fontWeight={500}
              lineHeight="base"
            >
              {issuer}
            </Text>
          </Stack>
        </Stack>
      </Stack>
      <Box>
        <Menu>
          <IconMenuItem icon="ads">My Ads</IconMenuItem>
          <IconMenuItem icon="cards">View all offers</IconMenuItem>
        </Menu>
      </Box>
    </Flex>
  )
}

export function AdStatusText({children, status = children}) {
  const statusColor = {
    [AdStatus.Showing]: 'green',
    [AdStatus.NotShowing]: 'red',
    [AdStatus.PartiallyShowing]: 'orange',
  }

  return (
    <Text
      color={(statusColor ?? 'brandGray')['500']}
      fontWeight={500}
      textTransform="capitalize"
    >
      {status}
    </Text>
  )
}

export function AdCoverImage({ad, ...props}) {
  return (
    <Image
      src={urlFromBytes(ad.cover)}
      fallbackSrc="/static/body-medium-pic-icn.svg"
      bg="gray.50"
      rounded="lg"
      size={60}
      {...props}
    />
  )
}

export function AdForm({onChange, ...ad}) {
  const [current, send] = useMachine(adFormMachine, {
    context: {
      ...ad,
    },
    actions: {
      change: context => onChange(context),
    },
  })

  const {title, cover, url, location, lang, age, os, stake} = current.context

  return (
    <Stack spacing={6} w="480px">
      <FormSection>
        <FormSectionTitle>Parameters</FormSectionTitle>
        <Stack isInline spacing={10}>
          <Stack spacing={4} shouldWrapChildren>
            <AdFormField label="Text" id="text" align="flex-start">
              <Textarea
                defaultValue={title}
                onBlur={e => send('CHANGE', {ad: {title: e.target.value}})}
              />
            </AdFormField>
            <AdFormField label="Link" id="link">
              <AdInput
                defaultValue={url}
                onBlur={e => send('CHANGE', {ad: {url: e.target.value}})}
              />
            </AdFormField>
          </Stack>
          <Stack spacing={4} alignItems="flex-start">
            {cover ? (
              <AdCoverImage ad={{cover}} size={20} />
            ) : (
              <FillCenter
                bg="gray.50"
                borderWidth="1px"
                borderColor="gray.300"
                h={20}
                w={20}
                rounded="lg"
                onClick={() => document.querySelector('#cover').click()}
              >
                <Icon name="photo" size={10} color="muted" />
              </FillCenter>
            )}
            <VisuallyHidden>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                opacity={0}
                onChange={async e => {
                  const {files} = e.target
                  if (files.length) {
                    const [file] = files
                    if (hasImageType(file)) {
                      send('CHANGE', {
                        ad: {cover: await file.arrayBuffer()},
                      })
                    }
                  }
                }}
              />
            </VisuallyHidden>
            <IconButton2
              as={FormLabel}
              htmlFor="cover"
              type="file"
              icon="upload"
            >
              Upload cover
            </IconButton2>
          </Stack>
        </Stack>
      </FormSection>
      <FormSection>
        <FormSectionTitle>Targeting conditions</FormSectionTitle>
        <Stack spacing={4} shouldWrapChildren>
          <AdFormField label="Location" id="location">
            <Select
              value={location}
              borderColor="gray.300"
              onChange={e => send('CHANGE', {ad: {location: e.target.value}})}
            >
              <option></option>
              {Object.values(countryCodes).map(c => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </AdFormField>
          <AdFormField label="Language" id="lang">
            <Select
              value={lang}
              borderColor="gray.300"
              onChange={e => send('CHANGE', {ad: {lang: e.target.value}})}
            >
              <option></option>
              {AVAILABLE_LANGS.map(l => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </AdFormField>
          <AdFormField label="Age" id="age">
            <AdNumberInput
              defaulValue={age}
              onBlur={({target: {value}}) => send('CHANGE', {ad: {age: value}})}
            />
          </AdFormField>
          <AdFormField label="Stake" id="stake">
            <DnaInput
              defaultValue={stake}
              onChange={({target: {value}}) =>
                send('CHANGE', {ad: {stake: value}})
              }
            />
          </AdFormField>
          <AdFormField label="OS" id="os">
            <Select
              value={os}
              borderColor="gray.300"
              onChange={e => send('CHANGE', {ad: {os: e.target.value}})}
            >
              <option></option>
              <option>macOS</option>
              <option>Windows</option>
              <option>Linux</option>
            </Select>
          </AdFormField>
        </Stack>
      </FormSection>
    </Stack>
  )
}

export function PublishAdDrawer({ad, ...props}) {
  const {i18n} = useTranslation()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing={4}>
          <FillCenter
            alignSelf="flex-start"
            bg="blue.012"
            w={12}
            minH={12}
            rounded="xl"
          >
            <Icon name="ads" size={6} color="brandBlue.500" />
          </FillCenter>
          <Heading fontSize="lg" fontWeight={500}>
            Pay
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody overflowY="auto" mx={-6}>
        <Stack spacing={6} color="brandGray.500" fontSize="md" p={6} pt={0}>
          <Text>
            In order to make your ads visible for Idena users you need to burn
            more coins than competitors targeting the same audience.
          </Text>
          <Stack spacing={6} bg="gray.50" p={6} rounded="lg">
            <Stack isInline spacing={5}>
              <AdCoverImage ad={ad} />
              <Text fontWeight={500}>{ad.title}</Text>
            </Stack>
            <Stack spacing={3}>
              <HDivider />
              <Stack>
                <InlineAdStat label="Competitors" value={10} />
                <InlineAdStat
                  label="Max price"
                  value={toLocaleDna(i18n.language)(0.22)}
                />
              </Stack>
              <HDivider />
              <Stack>
                <SmallInlineAdStat label="Location" value={ad.location} />
                <SmallInlineAdStat label="Language" value={ad.lang} />
                <SmallInlineAdStat label="Stake" value={ad.stake} />
                <SmallInlineAdStat label="Age" value={ad.age} />
                <SmallInlineAdStat label="OS" value={ad.os} />
              </Stack>
            </Stack>
          </Stack>
          <FormControl>
            <FormLabel htmlFor="amount">Amount, DNA</FormLabel>
            <DnaInput id="amount" />
          </FormControl>
        </Stack>
      </DrawerBody>
      <DrawerFooter
        borderTopWidth={1}
        borderTopColor="gray.300"
        py={3}
        px={4}
        position="absolute"
        left={0}
        right={0}
        bottom={0}
      >
        <PrimaryButton>Burn</PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}

export function ReviewAdDrawer({ad, isMining, onSend, ...props}) {
  const {t} = useTranslation()

  return (
    <AdDrawer isMining={isMining} ad={ad} {...props}>
      <DrawerHeader>
        <Stack spacing={4}>
          <FillCenter
            alignSelf="flex-start"
            bg="blue.012"
            w={12}
            minH={12}
            rounded="xl"
          >
            <Icon name="oracle" size={6} color="brandBlue.500" />
          </FillCenter>
          <Heading color="brandGray.500" fontSize="lg" fontWeight={500}>
            {t('Send to Oracle Voting')}
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody overflowY="auto" mx={-6}>
        <Stack spacing={6} color="brandGray.500" fontSize="md" p={6} pt={0}>
          <Stack spacing={3}>
            <Text>
              Please keep in mind that you will not be able to edit the banner
              after it has been submitted for verification
            </Text>
            {isMining && (
              <Badge
                display="inline-flex"
                alignItems="center"
                alignSelf="flex-start"
                variantColor="orange"
                bg="orange.020"
                color="orange.500"
                fontWeight="normal"
                rounded="xl"
                h={8}
                px={3}
                textTransform="initial"
                {...props}
              >
                Mining...
              </Badge>
            )}
          </Stack>
          <FormControl>
            <Stack>
              <FormLabel htmlFor="amount">Review fee, DNA</FormLabel>
              <DnaInput id="amount" onChange={() => {}} />
            </Stack>
          </FormControl>
        </Stack>
      </DrawerBody>
      <DrawerFooter
        spacing={2}
        borderTopWidth={1}
        borderTopColor="gray.300"
        py={3}
        px={4}
        position="absolute"
        left={0}
        right={0}
        bottom={0}
      >
        <Stack isInline>
          {/* eslint-disable-next-line react/destructuring-assignment */}
          <SecondaryButton onClick={props.onClose}>Not now</SecondaryButton>
          <PrimaryButton
            isLoading={isMining}
            loadingText="Sending..."
            onClick={onSend}
          >
            Send
          </PrimaryButton>
        </Stack>
      </DrawerFooter>
    </AdDrawer>
  )
}

export function AdDrawer({
  isCloseable = true,
  isMining = true,
  ad = {},
  children,
  ...props
}) {
  const {i18n} = useTranslation()
  return (
    <ChakraDrawer {...props}>
      <DrawerOverlay bg="xblack.080">
        {isMining && (
          <FillCenter h="full" pr={360}>
            <Box
              bg="white"
              rounded="lg"
              px={10}
              pt={37}
              pb={44}
              w={400}
              h={620}
            >
              <Stack spacing={10}>
                <Stack spacing={4}>
                  <Stack spacing="3/2">
                    <Text>{ad.title}</Text>
                    <ExternalLink href={ad.url}>{ad.url}</ExternalLink>
                  </Stack>
                  <Image src={urlFromBytes(ad.cover)} size="xs" />
                </Stack>
                <Stack spacing={6}>
                  <Flex justify="space-between">
                    <BlockAdStat label="Sponsored by" value={ad.issuer} />
                    <BlockAdStat
                      label="Burned for 24hrs"
                      value={toLocaleDna(i18n.language)(5827.567)}
                    />
                  </Flex>
                  <Box>
                    <SuccessAlert>
                      Watching ads makes your coin valuable!
                    </SuccessAlert>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </FillCenter>
        )}
      </DrawerOverlay>
      <DrawerContent px={8} py={12} maxW="sm">
        {isCloseable && <DrawerCloseButton />}
        {children}
      </DrawerContent>
    </ChakraDrawer>
  )
}
