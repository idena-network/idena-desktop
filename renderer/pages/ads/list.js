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
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {linearGradient, transparentize, cover} from 'polished'
import {
  AdList,
  AdEntry,
  Toolbar,
  Figure,
  FigureLabel,
  FigureNumber,
  AdImage,
  FigureGroup,
  AdEntryDivider,
  AdTarget,
  SmallFigureLabel,
  SmallFigureNumber,
  AdMenu,
  AdMenuItem,
  AdMenuItemIcon,
  AdBanner,
  NoAds,
} from '../../screens/ads/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import {rem} from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {
  SecondaryButton,
  IconButton,
  PrimaryButton,
} from '../../shared/components'
import {adsMachine} from '../../screens/ads/machine'
import {loadAds, AdStatus, adStatusColor, toDna} from '../../screens/ads/utils'
import {persistState} from '../../shared/utils/persist'

export default function MyAds() {
  const [
    {
      context: {ads},
    },
  ] = useMachine(
    adsMachine.withConfig(
      {
        actions: {
          // eslint-disable-next-line no-shadow
          persist: ({ads}) => {
            persistState('ads', ads)
          },
        },
      },
      {
        ads: loadAds(),
      }
    )
  )

  const {balance} = useIdentityState()

  const {isOpen, onOpen, onClose} = useDisclosure()

  const {address} = useIdentityState()

  return (
    <Layout>
      <AdBanner {...ads[0]} owner={address} />
      <Page as={Flex} flexDirection="column" h="calc(100vh - 56px)">
        <PageTitle>My Ads</PageTitle>
        <Toolbar>
          <FigureGroup>
            <Figure mr={rem(84)}>
              <FigureLabel>My balance</FigureLabel>
              <FigureNumber>{(balance || 0).toLocaleString()} DNA</FigureNumber>
            </Figure>
            <Figure>
              <FigureLabel>Total spent, 4hrs</FigureLabel>
              <FigureNumber>
                {ads
                  .map(({burnt}) => burnt || 0)
                  .reduce(add, 0)
                  .toLocaleString()}{' '}
                DNA
              </FigureNumber>
            </Figure>
          </FigureGroup>
          <NextLink href="/ads/new">
            <IconButton icon="plus-solid" ml="auto">
              New banner
            </IconButton>
          </NextLink>
        </Toolbar>
        <AdList spacing={4}>
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
                <Flex>
                  <Box w={rem(60)}>
                    <Box mb={3} position="relative">
                      <AdImage
                        src={adCover}
                        fallbackSrc="//placekitten.com/60/60"
                        alt={title}
                      ></AdImage>
                      {status !== AdStatus.Idle && (
                        <Box
                          rounded="lg"
                          {...cover()}
                          {...linearGradient({
                            colorStops: [
                              adStatusColor(status),
                              transparentize(0.84, adStatusColor(status)),
                            ],
                            fallback: 'none',
                            toDirection: 'to top',
                          })}
                        />
                      )}
                    </Box>
                    <Text
                      color={adStatusColor(status)}
                      fontWeight={500}
                      wordBreak="break-word"
                    >
                      {status}
                    </Text>
                  </Box>
                  <Box ml={5} flex={1}>
                    <Flex>
                      <Text fontSize={rem(14)} fontWeight={500}>
                        {title}
                      </Text>
                      <Stack isInline align="center" spacing={4} ml="auto">
                        <Box>
                          <AdMenu>
                            <NextLink href={`/ads/edit?id=${id}`}>
                              <AdMenuItem>
                                <AdMenuItemIcon name="edit" />
                                Edit
                              </AdMenuItem>
                            </NextLink>
                            <MenuDivider color="gray.100" my={2} />
                            <AdMenuItem color="red.500">
                              <AdMenuItemIcon name="delete" color="red.500" />
                              Delete
                            </AdMenuItem>
                          </AdMenu>
                        </Box>
                        <SecondaryButton onClick={onOpen}>Pay</SecondaryButton>
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
                          <SmallFigureNumber>{location}</SmallFigureNumber>
                          <SmallFigureNumber>{lang}</SmallFigureNumber>
                          <SmallFigureNumber>{stake}</SmallFigureNumber>
                        </Stack>
                      </Stack>
                      <Stack isInline spacing={2}>
                        <Stack spacing={1}>
                          <SmallFigureLabel>Age</SmallFigureLabel>
                          <SmallFigureLabel>OS</SmallFigureLabel>
                        </Stack>
                        <Stack spacing={1}>
                          <SmallFigureNumber>{age}</SmallFigureNumber>
                          <SmallFigureNumber>{os}</SmallFigureNumber>
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
                </Flex>
                <AdEntryDivider />
              </AdEntry>
            )
          )}
        </AdList>

        {ads.length === 0 && <NoAds />}

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
                  <AdImage src="//placekitten.com/60" size={rem(60)}></AdImage>
                  <Text fontWeight={500}>
                    A new ICO is running. DNA is accepted
                  </Text>
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
                      0.000000000123 DNA
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
                    <SmallFigureNumber>USA</SmallFigureNumber>
                    <SmallFigureNumber>en</SmallFigureNumber>
                    <SmallFigureNumber>>1000</SmallFigureNumber>
                    <SmallFigureNumber>22</SmallFigureNumber>
                    <SmallFigureNumber>macOS</SmallFigureNumber>
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
