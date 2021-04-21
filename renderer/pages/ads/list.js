import React from 'react'
import {Box, Flex, Stack, MenuDivider, Link} from '@chakra-ui/core'
import {useMachine} from '@xstate/react'
import NextLink from 'next/link'
import dayjs from 'dayjs'
import {useTranslation} from 'react-i18next'
import {
  AdList,
  AdEntry,
  AdMenu,
  AdMenuItem,
  AdMenuItemIcon,
  NoAds,
  AdStatNumber,
} from '../../screens/ads/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {add} from '../../shared/utils/math'
import Layout from '../../shared/components/layout'
import {Page, PageTitle} from '../../screens/app/components'
import {SecondaryButton} from '../../shared/components/button'
import {adListMachine} from '../../screens/ads/machines'
import {createAdDb} from '../../screens/ads/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {eitherState, toLocaleDna} from '../../shared/utils/utils'
import {useChainState} from '../../shared/providers/chain-context'
import {
  FilterButton,
  FilterButtonList,
  HDivider,
  VDivider,
} from '../../shared/components/components'
import {IconLink} from '../../shared/components/link'
import {
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
  const {balance} = useIdentityState()
  const epoch = useEpochState()

  const [current, send] = useMachine(adListMachine, {
    services: {
      init: () => createAdDb(epoch?.epoch ?? -1).all(),
    },
  })
  const {ads, selectedAd} = current.context

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
        <Flex justify="space-between" alignSelf="stretch">
          <FilterButtonList
            value="active"
            onChange={value => {
              if (value) send('FILTER', {value})
            }}
          >
            <FilterButton value="active">Active</FilterButton>
            <FilterButton value="drafts">Drafts</FilterButton>
            <FilterButton value="review">On review</FilterButton>
            <FilterButton value="rejected">Rejected</FilterButton>
          </FilterButtonList>
          <Stack isInline spacing={1} align="center">
            <VDivider />
            <IconLink icon="plus-solid" href="/ads/new">
              New banner
            </IconLink>
          </Stack>
        </Flex>
        <AdList py={4} spacing={4} alignSelf="stretch">
          {ads.map(
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
              status = AdStatus.Idle,
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
                    <Flex>
                      <NextLink href={`/ads/edit?id=${id}`} passHref>
                        <Link
                          fontSize="mdx"
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
                        {status === AdStatus.Approved && (
                          <SecondaryButton
                            onClick={() => {
                              send('SELECT', {id})
                            }}
                          >
                            Publish
                          </SecondaryButton>
                        )}
                        {status === AdStatus.Idle && (
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
                {ads.length > 1 && <HDivider />}
              </AdEntry>
            )
          )}
        </AdList>

        {current.matches('ready') && ads.length === 0 && <NoAds />}

        <PublishAdDrawer
          isOpen={eitherState(current, 'ready.publishing')}
          onClose={() => {
            send('CANCEL')
          }}
          ad={selectedAd}
        />

        <ReviewAdDrawer
          isOpen={eitherState(current, 'ready.sendingToReview')}
          onClose={() => {
            send('CANCEL')
          }}
          ad={selectedAd}
        />
      </Page>
    </Layout>
  )
}
