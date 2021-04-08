import React from 'react'
import {
  Box,
  Flex,
  Stack,
  Text,
  Divider,
  MenuDivider,
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  Heading,
  Icon,
  NumberInput,
  FormLabel,
  FormControl,
  Link,
  useTheme,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {transparentize} from 'polished'
import {useTranslation} from 'react-i18next'
import {
  AdList,
  AdEntry,
  Toolbar,
  Figure,
  FigureLabel,
  FigureNumber,
  AdImage,
  FigureGroup,
  AdTarget,
  SmallFigureLabel,
  AdMenu,
  AdMenuItem,
  AdMenuItemIcon,
  NoAds,
  SmallTargetFigure,
} from '../../screens/ads/components'
import {
  FlipFilter as FilterList,
  FlipFilterOption as FilterOption,
} from '../../screens/flips/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import {rem} from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {SecondaryButton, PrimaryButton} from '../../shared/components/button'
import {adListMachine} from '../../screens/ads/machines'
import {loadAds, AdStatus, adStatusColor} from '../../screens/ads/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {toLocaleDna} from '../../shared/utils/utils'
import {useChainState} from '../../shared/providers/chain-context'
import {HDivider, VDivider} from '../../shared/components/components'
import {IconLink} from '../../shared/components/link'
import {Fill} from '../../shared/components'

export default function MyAds() {
  const {i18n} = useTranslation()

  const {isOpen, onOpen, onClose} = useDisclosure()
  const {colors} = useTheme()

  const {syncing, offline} = useChainState()
  const {balance} = useIdentityState()
  const epoch = useEpochState()

  const [current, send] = useMachine(adListMachine, {
    services: {
      init: () => loadAds(epoch?.epoch ?? -1),
    },
  })
  const {ads, selected} = current.context

  const toDna = toLocaleDna(i18n.language)

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page as={Stack} spacing={4}>
        <PageTitle mb={4}>My Ads</PageTitle>
        <Toolbar w="full">
          <FigureGroup>
            <Figure mr={rem(84)}>
              <FigureLabel>My balance</FigureLabel>
              <FigureNumber>{toDna(balance)}</FigureNumber>
            </Figure>
            <Figure>
              <FigureLabel>Total spent, 4hrs</FigureLabel>
              <FigureNumber>
                {toDna(ads.map(({burnt}) => burnt || 0).reduce(add, 0))}
              </FigureNumber>
            </Figure>
          </FigureGroup>
        </Toolbar>
        <FilterList
          value="active"
          display="flex"
          alignItems="center"
          alignSelf="stretch"
          onChange={value => {
            if (value) send('FILTER', {value})
          }}
        >
          <FilterOption value="active">Active</FilterOption>
          <FilterOption value="drafts">Drafts</FilterOption>
          <FilterOption value="review">On review</FilterOption>
          <FilterOption value="rejected">Rejected</FilterOption>
          <VDivider ml="auto" />
          <IconLink icon="plus-solid" href="/ads/new">
            New banner
          </IconLink>
        </FilterList>
        <AdList py={4} spacing={4} alignSelf="stretch">
          {ads.map(
            ({
              id,
              cover: adCover,
              title,
              location,
              lang,
              age,
              os,
              stake,
              burnt: spent = 0,
              lastTx = dayjs(),
              status = AdStatus.Idle,
            }) => (
              <AdEntry key={id}>
                <Stack isInline spacing={5}>
                  <Stack spacing={3} w={rem(60)}>
                    <Box position="relative">
                      <AdImage
                        src={URL.createObjectURL(new Blob([adCover]))}
                        fallbackSrc="//placekitten.com/60/60"
                        alt={title}
                      />
                      {status === AdStatus.Idle && (
                        <Fill
                          rounded="lg"
                          backgroundImage={
                            // eslint-disable-next-line no-nested-ternary
                            status === AdStatus.PartiallyShowing
                              ? `linear-gradient(to top, ${
                                  colors.warning[500]
                                }, ${transparentize(100, colors.warning[500])})`
                              : status === AdStatus.NotShowing
                              ? `linear-gradient(to top, ${
                                  colors.red[500]
                                }, ${transparentize(100, colors.red[500])})`
                              : ''
                          }
                        />
                      )}
                    </Box>
                    <Text color={adStatusColor(status)} fontWeight={500}>
                      {status}
                    </Text>
                  </Stack>
                  <Box flex={1}>
                    <Flex>
                      <NextLink href={`/ads/edit?id=${id}`} passHref>
                        <Link
                          fontSize={rem(14)}
                          fontWeight={500}
                          _hover={{color: 'muted'}}
                        >
                          {title}
                        </Link>
                      </NextLink>
                      <Stack isInline align="center" spacing={4} ml="auto">
                        <Box>
                          <AdMenu>
                            <NextLink href={`/ads/edit?id=${id}`}>
                              <AdMenuItem>
                                <AdMenuItemIcon name="edit" />
                                Edit
                              </AdMenuItem>
                            </NextLink>
                            <MenuDivider
                              borderColor="gray.100"
                              borderWidth="1px"
                              my={2}
                            />
                            <AdMenuItem color="red.500">
                              <AdMenuItemIcon name="delete" color="red.500" />
                              Delete
                            </AdMenuItem>
                          </AdMenu>
                        </Box>
                        <SecondaryButton
                          onClick={() => {
                            send('SELECT', {id})
                            onOpen()
                          }}
                        >
                          Publish
                        </SecondaryButton>
                      </Stack>
                    </Flex>
                    <Stack isInline spacing={rem(58)} mt="px">
                      <Figure>
                        <FigureLabel>Spent, 4hrs</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {toDna(spent)}
                        </FigureNumber>
                      </Figure>
                      <Figure>
                        <FigureLabel>Total spent, DNA</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {toDna(spent)}
                        </FigureNumber>
                      </Figure>
                      <Figure>
                        <FigureLabel>Last tx</FigureLabel>
                        <FigureNumber fontSize={rem(13)}>
                          {dayjs().diff(lastTx, 'ms')} ms ago
                        </FigureNumber>
                      </Figure>
                    </Stack>
                    <AdTarget>
                      <Stack isInline spacing={2}>
                        <Stack spacing={1}>
                          <SmallFigureLabel>Location</SmallFigureLabel>
                          <SmallFigureLabel>Language</SmallFigureLabel>
                          <SmallFigureLabel>Stake</SmallFigureLabel>
                        </Stack>
                        <Stack spacing={1}>
                          <SmallTargetFigure>{location}</SmallTargetFigure>
                          <SmallTargetFigure>{lang}</SmallTargetFigure>
                          <SmallTargetFigure>{stake}</SmallTargetFigure>
                        </Stack>
                      </Stack>
                      <Stack isInline spacing={2}>
                        <Stack spacing={1}>
                          <SmallFigureLabel>Age</SmallFigureLabel>
                          <SmallFigureLabel>OS</SmallFigureLabel>
                        </Stack>
                        <Stack spacing={1}>
                          <SmallTargetFigure>{age}</SmallTargetFigure>
                          <SmallTargetFigure>{os}</SmallTargetFigure>
                        </Stack>
                      </Stack>
                      <Divider
                        borderColor="gray.100"
                        border="1px"
                        orientation="vertical"
                        opacity={1}
                      ></Divider>
                      <Box ml={4} mt={rem(6)}>
                        <Stack isInline spacing={2}>
                          <Stack spacing={rem(6)}>
                            <FigureLabel>Competitors</FigureLabel>
                            <FigureLabel>Max price</FigureLabel>
                          </Stack>
                          <Stack spacing={rem(6)}>
                            <FigureNumber fontSize={rem(13)} fontWeight={500}>
                              1
                            </FigureNumber>
                            <FigureNumber fontSize={rem(13)} fontWeight={500}>
                              0.000000000123 DNA
                            </FigureNumber>
                          </Stack>
                        </Stack>
                      </Box>
                    </AdTarget>
                  </Box>
                </Stack>
                {ads.length > 1 && <HDivider />}
              </AdEntry>
            )
          )}
        </AdList>

        {current.matches('ready') && ads.length === 0 && <NoAds />}

        <Drawer isOpen={isOpen} onClose={onClose} size={rem(360)}>
          <DrawerOverlay />
          <DrawerContent px={8} py={10} size={rem(360)}>
            <DrawerCloseButton />
            <DrawerHeader p={0}>
              <Box
                display="inline-block"
                bg="brandBlue.10"
                rounded="lg"
                mb={4}
                p={3}
                alignSelf="flex-start"
              >
                <Icon name="ads" size={6} color="brandBlue.500" />
              </Box>
              <Heading fontSize={rem(18)} fontWeight={500}>
                Pay
              </Heading>
            </DrawerHeader>
            <DrawerBody mt={2} p={0}>
              <Text>
                In order to make your ads visible for Idena users you need to
                burn more coins than competitors targeting the same audience.
              </Text>
              <Box bg="gray.50" p={6} my={6} rounded="lg">
                <Stack isInline spacing={rem(10)} mb={6}>
                  <AdImage src={selected.cover} size={rem(60)}></AdImage>
                  <Text fontWeight={500}>{selected.title}</Text>
                </Stack>
                <Divider />
                <Stack isInline spacing={6} my={rem(10)}>
                  <Stack spacing={rem(6)} w={rem(80)}>
                    <FigureLabel>Competitors</FigureLabel>
                    <FigureLabel>Max price</FigureLabel>
                  </Stack>
                  <Stack spacing={rem(6)}>
                    <FigureNumber fontSize={rem(13)} fontWeight={500}>
                      1
                    </FigureNumber>
                    <FigureNumber fontSize={rem(13)} fontWeight={500}>
                      {toDna(0.000000000123)} DNA
                    </FigureNumber>
                  </Stack>
                </Stack>
                <Divider borderWidth="1px" />
                <Stack isInline spacing={6} mt={4}>
                  <Stack spacing={1} w={rem(80)}>
                    <SmallFigureLabel>Location</SmallFigureLabel>
                    <SmallFigureLabel>Language</SmallFigureLabel>
                    <SmallFigureLabel>Stake</SmallFigureLabel>
                    <SmallFigureLabel>Age</SmallFigureLabel>
                    <SmallFigureLabel>OS</SmallFigureLabel>
                  </Stack>
                  <Stack spacing={1}>
                    <SmallTargetFigure>{selected.location}</SmallTargetFigure>
                    <SmallTargetFigure>{selected.lang}</SmallTargetFigure>
                    <SmallTargetFigure>{selected.stake}</SmallTargetFigure>
                    <SmallTargetFigure>{selected.age}</SmallTargetFigure>
                    <SmallTargetFigure>{selected.os}</SmallTargetFigure>
                  </Stack>
                </Stack>
              </Box>
              <FormControl>
                <FormLabel htmlFor="amount">Amount, DNA</FormLabel>
                <NumberInput id="amount"></NumberInput>
              </FormControl>
            </DrawerBody>
            <DrawerFooter p={0}>
              <PrimaryButton>Burn</PrimaryButton>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Page>
    </Layout>
  )
}
