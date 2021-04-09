import React from 'react'
import {
  Box,
  Flex,
  Stack,
  Text,
  MenuDivider,
  useDisclosure,
  Link,
  useTheme,
} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {useTranslation} from 'react-i18next'
import {
  AdList,
  AdEntry,
  AdImage,
  AdMenu,
  AdMenuItem,
  AdMenuItemIcon,
  NoAds,
  AdStatNumber,
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
import {
  AdOverlayStatus,
  BlockAdStat,
  InlineAdGroup,
  InlineAdStat,
  PublishAdDrawer,
  SmallInlineAdStat,
} from '../../screens/ads/containers'

export default function MyAds() {
  const {i18n} = useTranslation()

  const {isOpen, onOpen, onClose} = useDisclosure()

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
        <PageTitle>My Ads</PageTitle>
        <Stack isInline spacing={20}>
          <BlockAdStat label="My balance">
            <AdStatNumber fontSize="lg">{toDna(balance)}</AdStatNumber>
          </BlockAdStat>
          <BlockAdStat label="Total spent, 4hrs">
            <AdStatNumber fontSize="lg">
              {toDna(ads.map(({burnt = 0}) => burnt).reduce(add, 0))}
            </AdStatNumber>
          </BlockAdStat>
        </Stack>
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
                        <AdOverlayStatus status={status} />
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
                    <Stack isInline spacing={rem(58)}>
                      <BlockAdStat label="Spent, 4hrs" value={toDna(spent)} />
                      <BlockAdStat
                        label="Total spent, DNA"
                        value={toDna(spent)}
                      />
                      <BlockAdStat
                        label="Last tx"
                        value={`${dayjs().diff(lastTx, 'ms')} ms ago`}
                      />
                    </Stack>
                    <Stack
                      isInline
                      spacing={4}
                      bg="gray.50"
                      p={2}
                      my={5}
                      rounded="md"
                    >
                      <Stack flex={1} isInline px={2} pt={1}>
                        <InlineAdGroup spacing="3/2" labelWidth={55} flex={1}>
                          <SmallInlineAdStat
                            label="Location"
                            value={location}
                          />
                          <SmallInlineAdStat label="Language" value={lang} />
                          <SmallInlineAdStat label="Stake" value={stake} />
                        </InlineAdGroup>
                        <InlineAdGroup labelWidth={24} flex={1}>
                          <SmallInlineAdStat label="Age" value={age} />
                          <SmallInlineAdStat label="OS" value={os} />
                        </InlineAdGroup>
                      </Stack>
                      <VDivider minH={68} h="full" />
                      <Stack flex={1} justify="center">
                        <InlineAdStat label="Competitors" value={10} />
                        <InlineAdStat
                          label="Max price"
                          value={toLocaleDna(i18n.language)(0.000000000123)}
                        />
                      </Stack>
                    </Stack>
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
