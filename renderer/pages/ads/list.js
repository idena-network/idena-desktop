import React from 'react'
import {Box, Flex, Stack, Link} from '@chakra-ui/core'
import {useMachine, asEffect} from '@xstate/react'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {useTranslation} from 'react-i18next'
import {
  AdList,
  AdEntry,
  NoAds,
  AdStatNumber,
} from '../../screens/ads/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {SecondaryButton} from '../../shared/components/button'
import {adListMachine} from '../../screens/ads/machines'
import {
  createAdDb,
  fetchProfileAds,
  fetchTotalSpent,
} from '../../screens/ads/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {eitherState, mergeById, toLocaleDna} from '../../shared/utils/utils'
import {useChainState} from '../../shared/providers/chain-context'
import {
  FilterButton,
  FilterButtonList,
  HDivider,
  IconMenuItem,
  MenuDivider,
  Menu,
  VDivider,
} from '../../shared/components/components'
import {IconLink} from '../../shared/components/link'
import {
  AdBanner,
  AdCoverImage,
  AdOverlayStatus,
  AdStatusText,
  BlockAdStat,
  InlineAdGroup,
  InlineAdStat,
  PublishAdDrawer,
  ReviewAdDrawer,
  SmallInlineAdStat,
} from '../../screens/ads/containers'
import {AdStatus} from '../../shared/types'

export default function AdListPage() {
  const {i18n} = useTranslation()

  const {syncing, offline} = useChainState()
  const {address, balance} = useIdentityState()
  const epoch = useEpochState()

  const db = createAdDb(epoch?.epoch)

  const [current, send] = useMachine(adListMachine, {
    actions: {
      // eslint-disable-next-line no-unused-vars
      onSentToReview: asEffect(({selectedAd: {ref, ...ad}}) => {
        db.put(ad)
      }),
    },
    services: {
      init: async () => ({
        ads: mergeById(await db.all(), await fetchProfileAds(address)),
        totalSpent: await fetchTotalSpent(address),
      }),
      sendToReview: async () => Promise.resolve(),
    },
  })
  const {filteredAds, selectedAd, status, totalSpent} = current.context

  const toDna = toLocaleDna(i18n.language)

  return (
    <Layout syncing={syncing} offline={offline}>
      <AdBanner />
      <Page as={Stack} spacing={4}>
        <PageTitle>My Ads</PageTitle>
        <Stack isInline spacing={20}>
          <BlockAdStat label="My balance">
            <AdStatNumber fontSize="lg">{toDna(balance)}</AdStatNumber>
          </BlockAdStat>
          <BlockAdStat label="Total spent, 4hrs">
            <AdStatNumber fontSize="lg">{toDna(totalSpent)}</AdStatNumber>
          </BlockAdStat>
        </Stack>
        <Flex justify="space-between" alignSelf="stretch">
          <FilterButtonList
            value={status}
            onChange={value => {
              if (value) send('FILTER', {value})
            }}
          >
            <FilterButton value={AdStatus.Active}>Active</FilterButton>
            <FilterButton value={AdStatus.Draft}>Drafts</FilterButton>
            <FilterButton value={AdStatus.Reviewing}>On review</FilterButton>
            <FilterButton value={AdStatus.Rejected}>Rejected</FilterButton>
          </FilterButtonList>
          <Stack isInline spacing={1} align="center">
            <VDivider />
            <IconLink icon="plus-solid" href="/ads/new">
              New banner
            </IconLink>
          </Stack>
        </Flex>
        <AdList py={4} spacing={4} alignSelf="stretch">
          {filteredAds.map(
            ({
              id,
              cover,
              title,
              location,
              lang,
              age,
              os,
              stake,
              burnt: spent = 0,
              lastTx = dayjs(),
              // eslint-disable-next-line no-shadow
              status,
            }) => (
              <AdEntry key={id}>
                <Stack isInline spacing={5}>
                  <Stack spacing={3} w={60}>
                    <Box position="relative">
                      <AdCoverImage ad={{cover}} alt={title} />
                      {status === AdStatus.Idle && (
                        <AdOverlayStatus status={status} />
                      )}
                    </Box>
                    <AdStatusText status={status} />
                  </Stack>
                  <Box flex={1}>
                    <Flex justify="space-between">
                      <NextLink href={`/ads/edit?id=${id}`} passHref>
                        <Link
                          fontSize="mdx"
                          fontWeight={500}
                          _hover={{color: 'muted'}}
                        >
                          {title}
                        </Link>
                      </NextLink>
                      <Stack isInline align="center">
                        <Box>
                          <Menu>
                            <NextLink href={`/ads/edit?id=${id}`}>
                              <IconMenuItem icon="edit">Edit</IconMenuItem>
                            </NextLink>
                            <MenuDivider />
                            <IconMenuItem icon="delete" color="red.500">
                              Delete
                            </IconMenuItem>
                          </Menu>
                        </Box>
                        {status === AdStatus.Approved && (
                          <SecondaryButton
                            onClick={() => {
                              send('SELECT', {id})
                            }}
                          >
                            Publish
                          </SecondaryButton>
                        )}
                        {status === AdStatus.Active && (
                          <SecondaryButton
                            onClick={() => {
                              send('REVIEW', {id})
                            }}
                          >
                            Review
                          </SecondaryButton>
                        )}
                      </Stack>
                    </Flex>
                    <Stack isInline spacing={60}>
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

                {filteredAds.length > 1 && <HDivider />}
              </AdEntry>
            )
          )}
        </AdList>

        {current.matches('ready') && filteredAds.length === 0 && <NoAds />}

        <PublishAdDrawer
          isOpen={eitherState(current, 'ready.publishing')}
          onClose={() => {
            send('CANCEL')
          }}
          ad={selectedAd}
        />

        <ReviewAdDrawer
          isOpen={eitherState(current, 'ready.sendingToReview')}
          isMining={eitherState(current, 'ready.sendingToReview.mining')}
          ad={selectedAd}
          onSend={() => {
            send('SUBMIT')
          }}
          onClose={() => {
            send('CANCEL')
          }}
        />
      </Page>
    </Layout>
  )
}
