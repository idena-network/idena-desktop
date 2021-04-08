import React from 'react'
import {
  Box,
  Flex,
  Stack,
  Text,
  Divider,
  MenuDivider,
  useDisclosure,
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
import {SecondaryButton} from '../../shared/components/button'
import {adListMachine} from '../../screens/ads/machines'
import {
  loadAds,
  AdStatus,
  adStatusColor,
  adUrlFromBytes,
} from '../../screens/ads/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {toLocaleDna} from '../../shared/utils/utils'
import {useChainState} from '../../shared/providers/chain-context'
import {HDivider, VDivider} from '../../shared/components/components'
import {IconLink} from '../../shared/components/link'
import {Fill} from '../../shared/components'
import {PublishAdDrawer} from '../../screens/ads/containers'

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
                        src={adUrlFromBytes(adCover)}
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

        <PublishAdDrawer
          isOpen={isOpen}
          onClose={onClose}
          size={rem(360)}
          ad={selected}
        />
      </Page>
    </Layout>
  )
}
