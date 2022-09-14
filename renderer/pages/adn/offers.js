import {
  Center,
  Table,
  Tbody,
  Text,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useQueryClient} from 'react-query'
import {
  useApprovedBurntCoins,
  useProtoProfileDecoder,
} from '../../screens/ads/hooks'
import Layout from '../../shared/components/layout'
import {PageHeader, PageCloseButton} from '../../screens/ads/components'
import {AdOfferListItem, BurnDrawer} from '../../screens/ads/containers'
import {
  Page,
  PageTitle,
  RoundedTh,
  Tooltip,
} from '../../shared/components/components'
import {InfoIcon} from '../../shared/components/icons'
import {calculateTotalAdScore} from '../../screens/ads/utils'

export default function AdOfferList() {
  const {t} = useTranslation()

  const queryClient = useQueryClient()

  const {data: burntCoins, status: burntCoinsStatus} = useApprovedBurntCoins()

  const {decodeAdTarget} = useProtoProfileDecoder()

  const orderedBurntCoins = React.useMemo(
    () =>
      burntCoins
        .map(({target, ...burn}) => ({
          ...burn,
          totalScore: calculateTotalAdScore(decodeAdTarget(target)),
        }))
        .sort((a, b) => b.totalScore - a.totalScore),
    [burntCoins, decodeAdTarget]
  )

  const isFetched = burntCoinsStatus === 'success'

  const isEmpty = isFetched && burntCoins.length === 0

  const [selectedAd, setSelectedAd] = React.useState({})

  const burnDisclosure = useDisclosure()
  const {
    onOpen: onOpenBurnDisclosure,
    onClose: onCloseBurnDisclosure,
  } = burnDisclosure

  const handlePreviewBurn = React.useCallback(
    ad => {
      setSelectedAd(ad)
      onOpenBurnDisclosure()
    },
    [onOpenBurnDisclosure]
  )

  const handleBurn = React.useCallback(() => {
    onCloseBurnDisclosure()
    queryClient.invalidateQueries(['bcn_burntCoins', []])
  }, [onCloseBurnDisclosure, queryClient])

  return (
    <Layout skipBanner>
      <Page>
        <PageHeader>
          <PageTitle mb={0}>{t('All offers')}</PageTitle>
          <PageCloseButton href="/adn/list" />
        </PageHeader>

        <Table>
          <Thead>
            <Tr>
              <RoundedTh isLeft>{t('Banner/author')}</RoundedTh>
              <RoundedTh>{t('Website')}</RoundedTh>
              <RoundedTh>
                <Text w="16">
                  {t('Targeting coeff')}{' '}
                  <Tooltip
                    label="Coeff = iif(language, 22, 1) * iif(os, 5, 1)"
                    placement="top"
                  >
                    <InfoIcon cursor="help" flex={1} />
                  </Tooltip>
                </Text>
              </RoundedTh>
              <RoundedTh>{t('Burn')}</RoundedTh>
              <RoundedTh cursor="help">
                <Text w="14">
                  {t('Total score')}{' '}
                  <Tooltip label="Total score = burn * coeff" placement="top">
                    <InfoIcon cursor="help" />
                  </Tooltip>
                </Text>
              </RoundedTh>
              <RoundedTh isRight />
            </Tr>
          </Thead>
          <Tbody>
            {isFetched &&
              orderedBurntCoins.map(burn => (
                <AdOfferListItem
                  key={burn.key}
                  burn={burn}
                  onBurn={handlePreviewBurn}
                />
              ))}
          </Tbody>
        </Table>

        {isEmpty && (
          <Center color="muted" mt="4" w="full">
            {t('No active offers')}
          </Center>
        )}

        <BurnDrawer ad={selectedAd} onBurn={handleBurn} {...burnDisclosure} />
      </Page>
    </Layout>
  )
}
