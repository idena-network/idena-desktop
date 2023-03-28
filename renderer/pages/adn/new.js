import * as React from 'react'
import {Box, HStack, Text, useDisclosure} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import nanoid from 'nanoid'
import Layout from '../../shared/components/layout'
import {AdForm, AdPreview} from '../../screens/ads/containers'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  PageHeader,
  PageCloseButton,
  PageFooter,
} from '../../screens/ads/components'
import {AdStatus} from '../../screens/ads/types'
import {useCoinbase} from '../../screens/ads/hooks'
import {ArrowRightIcon} from '../../shared/components/icons'
import {Page, PageTitle} from '../../shared/components/components'
import {dexieDb} from '../../shared/utils/dexieDb'

export default function NewAdPage() {
  const {t} = useTranslation()

  const router = useRouter()

  const coinbase = useCoinbase()

  const adFormRef = React.useRef()

  const previewAdRef = React.useRef()

  const previewDisclosure = useDisclosure()

  return (
    <Layout>
      <Page px={0} py={0} overflow="hidden">
        <Box flex={1} w="full" px={20} py={6} overflowY="auto">
          <PageHeader>
            <PageTitle mb={0}>{t('New ad')}</PageTitle>
            <PageCloseButton href="/adn/list" />
          </PageHeader>

          <AdForm
            ref={adFormRef}
            id="adForm"
            onSubmit={async (ad) => {
              await dexieDb.table('ads').add({
                ...ad,
                id: nanoid(),
                status: AdStatus.Draft,
                author: coinbase,
              })

              router.push('/adn/list?from=new&save=true')
            }}
          />
        </Box>

        <PageFooter>
          <SecondaryButton
            onClick={() => {
              const ad = Object.fromEntries(
                new FormData(adFormRef.current).entries()
              )

              previewAdRef.current = {
                ...ad,
                author: coinbase,
                thumb: ad.thumb && URL.createObjectURL(ad.thumb),
                media: ad.media && URL.createObjectURL(ad.media),
              }

              previewDisclosure.onOpen()
            }}
          >
            <HStack spacing="1">
              <ArrowRightIcon boxSize="5" />
              <Text>{t('Show preview')}</Text>
            </HStack>
          </SecondaryButton>
          <PrimaryButton form="adForm" type="submit">
            {t('Save')}
          </PrimaryButton>
        </PageFooter>
      </Page>

      <AdPreview ad={previewAdRef.current} {...previewDisclosure} />
    </Layout>
  )
}
