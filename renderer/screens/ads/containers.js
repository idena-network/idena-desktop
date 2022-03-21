/* eslint-disable react/prop-types */
import React from 'react'
import {
  AspectRatioBox,
  Flex,
  Image,
  Stack,
  Text,
  MenuItem,
  Box,
  Heading,
  Stat,
  Icon,
} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {
  Avatar,
  Drawer,
  DrawerPromotionPortal,
  ExternalLink,
  Menu,
  Skeleton,
  SuccessAlert,
} from '../../shared/components/components'
import {useAdRotation} from './hooks'
import {omit, pick} from '../../shared/utils/utils'
import {getRandomInt} from '../flips/utils'
import {AdStatLabel, AdStatNumber} from './components'

export function AdBanner() {
  const {t} = useTranslation()

  const router = useRouter()

  const ads = useAdRotation()

  const adLength = ads?.length

  const activeAdIndex = React.useMemo(() => getRandomInt(0, adLength), [
    adLength,
  ])

  const activeAd = ads[activeAdIndex]

  return (
    <Flex
      align="center"
      justify="space-between"
      borderBottomWidth={1}
      borderBottomColor="gray.100"
      px={4}
      py={2}
    >
      <AdBannerActiveAd {...activeAd} />
      {false && (
        <Menu>
          <MenuItem
            icon={<Icon name="ads" boxSize={5} color="blue.500" />}
            onClick={() => {
              router.push(`/ads/list`)
            }}
          >
            {t('My Ads')}
          </MenuItem>
          <MenuItem icon={<Icon name="pic" boxSize={5} color="blue.500" />}>
            {t('View all offers')}
          </MenuItem>
        </Menu>
      )}
    </Flex>
  )
}

function AdBannerActiveAd({title, url, cover, author}) {
  return (
    <Stack
      isInline
      spacing={2}
      onClick={() => {
        global.openExternal(url)
      }}
    >
      <Skeleton isLoaded={Boolean(cover)}>
        <PlainAdCoverImage src={cover} w={10} />
      </Skeleton>
      <Stack spacing={1}>
        <Skeleton isLoaded={Boolean(title)} minW="2xs" w="2xs" minH={4}>
          <Text lineHeight="none">{title}</Text>
        </Skeleton>
        <Skeleton isLoaded={Boolean(author)} minW="xs">
          <Stack isInline spacing={1}>
            <Avatar
              address={author}
              size={4}
              borderWidth={1}
              borderColor="brandGray.016"
              rounded="sm"
            />
            <Text color="muted" fontSize="sm" fontWeight={500}>
              {author}
            </Text>
          </Stack>
        </Skeleton>
      </Stack>
    </Stack>
  )
}

export function AdCoverImage({ad, ...props}) {
  const cover = ad?.cover

  const src = React.useMemo(
    () => URL.createObjectURL(new Blob([cover], {type: 'image/jpeg'})),
    [cover]
  )

  return <PlainAdCoverImage src={src} {...props} />
}

// TODO: https://github.com/chakra-ui/chakra-ui/issues/5285
export function PlainAdCoverImage(props) {
  const boxProps = pick(props, ['w', 'width', 'h', 'height', 'boxSize'])
  const imageProps = omit(props, Object.keys(boxProps))

  return (
    <AspectRatioBox ratio={1} {...boxProps}>
      <Image ignoreFallback bg="gray.50" rounded="lg" {...imageProps} />
    </AspectRatioBox>
  )
}

export function AdDrawer({isMining = true, children, ...props}) {
  const ads = useAdRotation()

  const adLength = ads?.length

  const hasRotatingAds = adLength > 0

  const activeAdIndex = React.useMemo(() => getRandomInt(0, adLength), [
    adLength,
  ])

  const activeAd = ads[activeAdIndex]

  return (
    <Drawer {...props}>
      {children}

      {isMining && hasRotatingAds && (
        <DrawerPromotionPortal>
          <AdPromotion {...activeAd} />
        </DrawerPromotionPortal>
      )}
    </Drawer>
  )
}

function AdPromotion({title, url, cover, author}) {
  const {t} = useTranslation()

  return (
    <Box bg="white" rounded="lg" px={10} pt={37} pb={44} w={400} h={620}>
      <Stack spacing="10">
        <Stack spacing="4">
          <Stack spacing="1.5">
            <Heading as="h4" fontWeight="semibold" fontSize="md">
              {title}
            </Heading>
            <ExternalLink href={url}>{url}</ExternalLink>
          </Stack>
          <PlainAdCoverImage src={cover} w={320} objectFit="cover" />
        </Stack>
        <Stack spacing={6}>
          <Stack isInline justify="space-between" align="flex-start">
            <BlockAdStat label="Sponsored by" value={author} />
          </Stack>
          <Box>
            <SuccessAlert fontSize="md">
              {t('Watching ads makes your coin valuable!')}
            </SuccessAlert>
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}

export function BlockAdStat({label, value, children, ...props}) {
  return (
    <Stat {...props}>
      {label && <AdStatLabel>{label}</AdStatLabel>}
      {value && <AdStatNumber>{value}</AdStatNumber>}
      {children}
    </Stat>
  )
}
