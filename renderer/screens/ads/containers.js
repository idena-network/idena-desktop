/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  DrawerFooter,
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
import {IconButton2, PrimaryButton} from '../../shared/components/button'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  FormLabel,
  HDivider,
  Input,
  Textarea,
} from '../../shared/components/components'
import {countryCodes, toLocaleDna, urlFromBytes} from '../../shared/utils/utils'
import {DnaInput, FillCenter} from '../oracles/components'
import {
  AdFormField,
  AdInput,
  AdMenu,
  AdMenuItem,
  AdMenuItemIcon,
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

export function AdBanner({title, cover, owner, url}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      borderBottom="1px"
      borderBottomColor="gray.100"
      color="brandGray.500"
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex="banner"
    >
      <Stack
        isInline
        spacing={2}
        cursor="pointer"
        onClick={() => global.openExternal(url)}
      >
        <AdCoverImage ad={{cover}} size={40} />
        <Box>
          <Text>{title}</Text>
          <Stack isInline spacing={1}>
            <Image
              src={`https://robohash.org/${owner}`}
              size={4}
              border="1px"
              borderColor="brandGray.16"
              rounded="md"
            />
            <Text
              color="muted"
              fontSize="sm"
              fontWeight={500}
              lineHeight="base"
            >
              {owner}
            </Text>
          </Stack>
        </Box>
      </Stack>
      <Box>
        <AdMenu>
          <AdMenuItem>
            <AdMenuItemIcon name="ads" />
            My Ads
          </AdMenuItem>
          <AdMenuItem>
            <AdMenuItemIcon name="cards" />
            View all offers
          </AdMenuItem>
        </AdMenu>
      </Box>
    </Flex>
  )
}

export function AdStatusText({status}) {
  const statusColor = {
    [AdStatus.Showing]: 'green',
    [AdStatus.NotShowing]: 'red',
    [AdStatus.PartiallyShowing]: 'orange',
  }

  return (
    <Text color={(statusColor ?? 'brandGray')['500']} fontWeight={500}>
      {status}
    </Text>
  )
}

export function AdCoverImage({ad, ...props}) {
  return (
    <Image
      src={urlFromBytes(ad.cover)}
      fallbackSrc="//placekitten.com/60/60"
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
