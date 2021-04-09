/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  DrawerFooter,
  FormControl,
  Heading,
  Icon,
  Stack,
  Stat,
  Text,
  useTheme,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {PrimaryButton} from '../../shared/components/button'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  FormLabel,
  HDivider,
} from '../../shared/components/components'
import {toLocaleDna} from '../../shared/utils/utils'
import {DnaInput, FillCenter} from '../oracles/components'
import {AdImage, AdStatLabel, AdStatNumber} from './components'
import {AdStatus, adUrlFromBytes} from './utils'
import {Fill} from '../../shared/components'

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
              <AdImage src={adUrlFromBytes(ad.cover)} size={60}></AdImage>
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
