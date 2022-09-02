import {Center, Table, Tbody, Thead, Tr, useDisclosure} from '@chakra-ui/react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useQueryClient} from 'react-query'
import {useApprovedBurntCoins} from '../../screens/ads/hooks'
import {Page, PageTitle} from '../../screens/app/components'
import {RoundedTh} from '../../shared/components/components'
import Layout from '../../shared/components/layout'
import {PageHeader, PageCloseButton} from '../../screens/ads/components'
import {AdOfferListItem, BurnDrawer} from '../../screens/ads/containers'

export default function AdOfferList() {
  const {t} = useTranslation()

  const queryClient = useQueryClient()

  const {data: burntCoins, status: burntCoinsStatus} = useApprovedBurntCoins()

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
          <PageTitle mb={4}>{t('All offers')}</PageTitle>
          <PageCloseButton href="/adn/list" />
        </PageHeader>
        <Table>
          <Thead>
            <Tr>
              <RoundedTh isLeft>{t('Banner/author')}</RoundedTh>
              <RoundedTh>{t('Website')}</RoundedTh>
              <RoundedTh>{t('Target')}</RoundedTh>
              <RoundedTh>{t('Burn')}</RoundedTh>
              <RoundedTh isRight />
            </Tr>
          </Thead>
          <Tbody>
            {isFetched &&
              burntCoins.map(burn => (
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
