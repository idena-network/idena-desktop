/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useSwipeable} from 'react-swipeable'
import {
  Avatar,
  SmallText,
  SuccessAlert,
} from '../../../shared/components/components'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  InfoIcon,
} from '../../../shared/components/icons'
import {useFormatDna} from '../../../shared/hooks/hooks'
import {useLanguage} from '../../../shared/hooks/use-language'
import {AdBurnKey} from '../../../shared/models/adBurnKey'
import {AdImage} from '../../ads/components'
import {useBurntCoins, useRotateAds} from '../../ads/hooks'

export function ValidationAdPromotion() {
  const {t} = useTranslation()

  const {lng} = useLanguage()

  const {ads, currentIndex, setCurrentIndex, prev, next} = useRotateAds()

  const currentAd = ads[currentIndex]

  const {data: burntCoins} = useBurntCoins()

  const orderedBurntCoins =
    burntCoins
      ?.sort((a, b) => b.amount - a.amount)
      .map((burn) => ({...burn, ...AdBurnKey.fromHex(burn?.key)})) ?? []

  const maybeBurn = orderedBurntCoins.find(
    (burn) => burn.cid === currentAd?.cid
  )

  const formatDna = useFormatDna()

  const swipeProps = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const burnDuration = new Intl.RelativeTimeFormat(lng, {
    style: 'short',
  }).format(24, 'hour')

  if (ads.length > 0) {
    return (
      <Stack spacing="4">
        <Box position="relative">
          <AdNavButton
            icon={<ArrowLeftIcon boxSize="5" />}
            position="absolute"
            left="-12"
            top="50%"
            transform="translateY(-50%)"
            onClick={prev}
          />
          <Box bg="gray.500" borderRadius="lg" p="10" w="full">
            <Stack direction="row" spacing="8" {...swipeProps}>
              <AdImage
                src={currentAd?.media}
                w="212px"
                h="212px"
                onClick={() => global.openExternal(currentAd?.url)}
              />
              <Stack spacing="7">
                <Stack spacing="5">
                  <Stack spacing="1.5" width="xs">
                    <Stack spacing="2">
                      <Heading
                        as="h3"
                        fontSize="md"
                        fontWeight={500}
                        noOfLines={1}
                      >
                        {currentAd?.title}
                      </Heading>
                      <Text color="muted" noOfLines={2} h="10" maxH="10">
                        {currentAd?.desc}
                      </Text>
                    </Stack>
                    <Text
                      noOfLines={2}
                      color="blue.500"
                      fontWeight={500}
                      cursor="pointer"
                      h="38px"
                      _hover={{
                        textDecoration: 'underline',
                      }}
                      onClick={() => {
                        global.openExternal(currentAd?.url)
                      }}
                    >
                      {currentAd?.url}
                    </Text>
                  </Stack>
                  <Stack direction="row" spacing="8">
                    <AdStat label={t('Sponsored by')} maxW="24">
                      <AdStatValue as={HStack} spacing="1" align="center">
                        <Avatar
                          address={currentAd?.author}
                          boxSize="4"
                          borderRadius="sm"
                        />
                        <Text as="span" isTruncated>
                          {currentAd?.author}
                        </Text>
                      </AdStatValue>
                    </AdStat>
                    <AdStat
                      label={t('Burnt, {{time}}', {time: burnDuration})}
                      value={formatDna(maybeBurn?.amount ?? 0)}
                    />
                  </Stack>
                </Stack>
                <SuccessAlert
                  icon={<InfoIcon color="green.500" boxSize="5" mr="3" />}
                  fontSize="md"
                >
                  {t('Watching ads makes your coin valuable!')}
                </SuccessAlert>
              </Stack>
            </Stack>
          </Box>
          <AdNavButton
            icon={<ArrowRightIcon boxSize="5" />}
            position="absolute"
            right="-12"
            top="50%"
            transform="translateY(-50%)"
            onClick={next}
          />
        </Box>
        <HStack spacing="2.5" justify="center" align="center" h="2">
          {ads.map((ad, idx) => {
            const isCurrrent = currentIndex === idx

            const isSibling = Math.abs(currentIndex - idx) === 1

            // eslint-disable-next-line no-nested-ternary
            const boxSize = isCurrrent ? '2' : isSibling ? '1.5' : '1'

            return (
              <Button
                key={ad.cid}
                variant="unstyled"
                bg={
                  // eslint-disable-next-line no-nested-ternary
                  isCurrrent
                    ? 'white'
                    : isSibling
                    ? 'transparent'
                    : 'xwhite.016'
                }
                borderColor="xwhite.016"
                borderWidth={isSibling ? 2 : 0}
                rounded="full"
                boxSize={boxSize}
                minW={boxSize}
                onClick={() => {
                  setCurrentIndex(idx)
                }}
              />
            )
          })}
        </HStack>
      </Stack>
    )
  }

  return null
}

function AdStat({label, value, children, ...props}) {
  return (
    <Stack spacing="1.5" {...props}>
      <Text fontWeight={500} lineHeight="4">
        {label}
      </Text>
      {value && <AdStatValue>{value}</AdStatValue>}
      {children}
    </Stack>
  )
}

function AdStatValue(props) {
  return <SmallText fontWeight={500} lineHeight={[null, '14px']} {...props} />
}

function AdNavButton(props) {
  return (
    <IconButton
      variant="unstyled"
      size="sm"
      color="xwhite.050"
      _hover={{
        color: 'white',
      }}
      transition="all 0.2s ease-out"
      {...props}
    />
  )
}
