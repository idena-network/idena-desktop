import React from 'react'
import {Flex, Stack, HStack, useDisclosure, Box, Button} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import NextLink from 'next/link'
import {useQueryClient} from 'react-query'
import {ReactQueryDevtools} from 'react-query/devtools'
import {
  AdList,
  EmptyAdList,
  AdStatNumber,
  LoadingAdList,
} from '../../screens/ads/components'
import Layout from '../../shared/components/layout'
import {
  BlockAdStat,
  AdListItem,
  ReviewAdDrawer,
  PublishAdDrawer,
  BurnDrawer,
  AdPreview,
  AdDebug,
} from '../../screens/ads/containers'
import {
  useBalance,
  useCoinbase,
  useFormatDna,
  usePersistedAds,
  useProfileAds,
} from '../../screens/ads/hooks'
import {AdStatus} from '../../screens/ads/types'
import {
  Debug,
  Drawer,
  DrawerBody,
  FilterButton,
  FilterButtonList,
  Page,
  PageTitle,
  Skeleton,
  VDivider,
} from '../../shared/components/components'
import {PlusSolidIcon, RefreshIcon} from '../../shared/components/icons'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {useClosableToast, useFailToast} from '../../shared/hooks/use-toast'
import {dexieDb} from '../../shared/utils/dexieDb'

export default function AdListPage() {
  const {t} = useTranslation()

  const formatDna = useFormatDna()

  const reviewDisclosure = useDisclosure()
  const publishDisclosure = useDisclosure()
  const burnDisclosure = useDisclosure()

  const coinbase = useCoinbase()

  const balance = useBalance(coinbase)

  const [filter, setFilter] = React.useState(() =>
    typeof window === 'undefined'
      ? AdStatus.Approved
      : localStorage?.getItem('adListFilter') ?? AdStatus.Approved
  )

  React.useEffect(() => {
    localStorage.setItem('adListFilter', filter)
  }, [filter])

  const {
    data: profileAds,
    refetch: refetchProfileAds,
    status: profileAdsStatus,
  } = useProfileAds()

  const {
    data: persistedAds,
    refetch: refetchPersistedAds,
    status: persistedAdsStatus,
  } = usePersistedAds()

  const loadingStatus =
    profileAdsStatus === 'loading' || persistedAdsStatus === 'loading'
      ? 'loading'
      : 'done'

  const ads = [
    ...profileAds,
    ...(persistedAds?.filter(
      a => profileAds.findIndex(b => a?.cid === b?.cid) < 0
    ) ?? []),
  ].filter(ad => ad?.status === filter)

  const [selectedAd, setSelectedAd] = React.useState({})

  const refetchAds = React.useCallback(() => {
    refetchProfileAds()
    refetchPersistedAds()
  }, [refetchPersistedAds, refetchProfileAds])

  const {toast, close: closeToast} = useClosableToast()
  const failToast = useFailToast()

  const {onClose: onClosePublishDisclosure} = publishDisclosure

  const handlePublish = React.useCallback(async () => {
    try {
      await dexieDb.table('ads').update(selectedAd.id, {
        status: AdStatus.Published,
      })

      refetchAds()

      toast({
        title: t('Ad campaign is successfully created'),
        actionContent: t(`View 'Campaigns'`),
        onAction: () => {
          setFilter(AdStatus.Published)
          closeToast()
        },
      })
    } catch {
      console.error('Error updating persisted ads', {id: selectedAd?.id})
    } finally {
      onClosePublishDisclosure()
    }
  }, [closeToast, onClosePublishDisclosure, refetchAds, selectedAd, t, toast])

  const {onClose: onCloseReviewDisclosure} = reviewDisclosure

  const handleStartVoting = React.useCallback(
    async ({cid, contract}) => {
      try {
        await dexieDb.table('ads').update(selectedAd.id, {
          status: AdStatus.Reviewing,
          cid,
          contract,
        })

        refetchAds()

        toast({
          title: t('Ad has been sent to oracles review'),
          actionContent: t(`View 'On review'`),
          onAction: () => {
            setFilter(AdStatus.Reviewing)
            closeToast()
          },
        })
      } catch (e) {
        console.error(e)
        console.error('Error updating persisted ads', {
          id: selectedAd?.id,
        })
      } finally {
        onCloseReviewDisclosure()
      }
    },
    [closeToast, onCloseReviewDisclosure, refetchAds, selectedAd, t, toast]
  )

  const queryClient = useQueryClient()

  const {onClose: onCloseBurnDisclosure} = burnDisclosure

  const handleBurn = React.useCallback(() => {
    onCloseBurnDisclosure()
    queryClient.invalidateQueries(['bcn_burntCoins', []])
  }, [onCloseBurnDisclosure, queryClient])

  const {query, replace} = useRouter()

  React.useEffect(() => {
    if (query.from === 'new' && query.save) {
      toast({
        title: t('Ad has been saved to drafts'),
        actionContent: t(`View 'Drafts'`),
        onAction: () => {
          setFilter(AdStatus.Draft)
          closeToast()
          replace('/adn/list')
        },
      })
    }
  }, [closeToast, query, replace, t, toast])

  const handleDeployContract = React.useCallback(
    ({cid, contract}) => {
      dexieDb.table('ads').update(selectedAd?.id, {
        cid,
        contract,
        author: coinbase,
        status: AdStatus.Reviewing,
      })
      refetchPersistedAds()
    },
    [coinbase, refetchPersistedAds, selectedAd]
  )

  const handleRemoveAd = React.useCallback(
    async ad => {
      try {
        if (ad.id) {
          await dexieDb.table('ads').delete(ad.id)
        } else {
          await dexieDb
            .table('ads')
            .where({cid: ad.cid})
            .delete()
        }
      } catch {
        console.error({ad}, 'failed to delete ad')
        failToast('Failed to delete ad')
      } finally {
        refetchPersistedAds()
      }
    },
    [failToast, refetchPersistedAds]
  )

  const previewAdDisclosure = useDisclosure()

  const devToolsDisclosure = useDisclosure()

  React.useEffect(() => {
    if (query.filter) {
      setFilter(query.filter)
      replace('/adn/list')
    }
  }, [query, replace])

  return (
    <Layout>
      <Page pt={[4, 6]}>
        <PageTitle>{t('My Ads')}</PageTitle>

        <HStack spacing={20} pb="2" pt="1">
          <BlockAdStat label="My balance" w="2xs">
            <Skeleton isLoaded={Boolean(balance)}>
              <AdStatNumber fontSize="lg" lineHeight="5" isTruncated>
                {formatDna(balance)}
              </AdStatNumber>
            </Skeleton>
          </BlockAdStat>
        </HStack>

        <FilterButtonList value={filter} onChange={setFilter} w="full" mt={4}>
          <Flex align="center" justify="space-between" w="full">
            <HStack>
              <FilterButton value={AdStatus.Published}>
                {t('Campaigns')}
              </FilterButton>
              <VDivider />
              <FilterButton value={AdStatus.Draft}>{t('Drafts')}</FilterButton>
              <FilterButton value={AdStatus.Reviewing}>
                {t('On review')}
              </FilterButton>
              <FilterButton value={AdStatus.Approved}>
                {t('Approved')}
              </FilterButton>
              <FilterButton value={AdStatus.Rejected}>
                {t('Rejected')}
              </FilterButton>
            </HStack>

            <HStack spacing={1} align="center">
              <Button
                variant="ghost"
                colorScheme="blue"
                leftIcon={<RefreshIcon boxSize="5" />}
                px="1"
                onClick={refetchAds}
              >
                {t('Refresh')}
              </Button>
              <VDivider />
              <NextLink href="/adn/new">
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  leftIcon={<PlusSolidIcon boxSize="5" />}
                  px="1"
                >
                  {t('New ad')}
                </Button>
              </NextLink>
            </HStack>
          </Flex>
        </FilterButtonList>

        {loadingStatus === 'done' && (
          <AdList spacing={4} w="full" my="8">
            {ads.map(ad => (
              <AdListItem
                key={`${ad.cid}!!${ad.id}!!${ad.target}`}
                ad={ad}
                onReview={() => {
                  setSelectedAd(ad)
                  reviewDisclosure.onOpen()
                }}
                onPublish={() => {
                  setSelectedAd(ad)
                  publishDisclosure.onOpen()
                }}
                onBurn={() => {
                  setSelectedAd(ad)
                  burnDisclosure.onOpen()
                }}
                onRemove={handleRemoveAd}
                onPreview={() => {
                  setSelectedAd(ad)
                  previewAdDisclosure.onOpen()
                }}
              />
            ))}
          </AdList>
        )}

        {loadingStatus === 'loading' && <LoadingAdList />}

        {loadingStatus === 'done' && ads.length === 0 && (
          <EmptyAdList>
            {filter === AdStatus.Published
              ? t(`You haven't created any campaigns yet`)
              : t('No corresponding ads')}
          </EmptyAdList>
        )}

        <ReviewAdDrawer
          ad={selectedAd}
          onDeployContract={handleDeployContract}
          onStartVoting={handleStartVoting}
          {...reviewDisclosure}
        />

        <PublishAdDrawer
          ad={selectedAd}
          onPublish={handlePublish}
          {...publishDisclosure}
        />

        <BurnDrawer ad={selectedAd} onBurn={handleBurn} {...burnDisclosure} />

        <AdPreview ad={selectedAd} {...previewAdDisclosure} />

        {typeof window !== 'undefined' &&
          window.location.hostname.includes('localhost') && (
            <>
              <Box position="fixed" bottom="8" right="8">
                <SecondaryButton onClick={devToolsDisclosure.onOpen}>
                  Debug ads
                </SecondaryButton>
              </Box>

              <Drawer title="Debug ads" size="xl" {...devToolsDisclosure}>
                <DrawerBody>
                  <Stack spacing="10">
                    <Box>
                      <h4>Current ads</h4>
                      <Debug>{ads}</Debug>
                    </Box>

                    <Box>
                      <h4>Decoders</h4>
                      <AdDebug />
                    </Box>
                  </Stack>
                </DrawerBody>
              </Drawer>
              <ReactQueryDevtools />
            </>
          )}
      </Page>
    </Layout>
  )
}
