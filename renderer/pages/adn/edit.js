import * as React from 'react'
import {Box, HStack, Text, useDisclosure} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {TriangleUpIcon} from '@chakra-ui/icons'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {AdForm, AdPreview} from '../../screens/ads/containers'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  PageHeader,
  PageCloseButton,
  PageFooter,
} from '../../screens/ads/components'
import db from '../../shared/utils/db'
import {useCoinbase, usePersistedAd} from '../../screens/ads/hooks'
import {isValidImage} from '../../screens/ads/utils'

export default function EditAdPage() {
  const {t} = useTranslation()

  const router = useRouter()

  const {data: ad} = usePersistedAd(router.query.id)

  const coinbase = useCoinbase()

  const adFormRef = React.useRef()

  const previewAdRef = React.useRef()

  const previewDisclosure = useDisclosure()

  return (
    <Layout showHamburger={false}>
      <Page px={0} py={0} overflow="hidden">
        <Box flex={1} w="full" px={20} py={6} overflowY="auto">
          <PageHeader>
            <PageTitle mb={0}>{t('Edit ad')}</PageTitle>
            <PageCloseButton href="/adn/list" />
          </PageHeader>

          <AdForm
            ref={adFormRef}
            id="adForm"
            ad={ad}
            onSubmit={async nextAd => {
              await db.table('ads').update(ad.id, nextAd)
              router.push('/adn/list')
            }}
          />
        </Box>

        <PageFooter>
          <SecondaryButton
            onClick={async () => {
              const currentAd = Object.fromEntries(
                new FormData(adFormRef.current).entries()
              )

              previewAdRef.current = {
                ...ad,
                ...currentAd,
                author: ad.author ?? coinbase,
                thumb: isValidImage(currentAd.thumb)
                  ? URL.createObjectURL(currentAd.thumb)
                  : ad.thumb,
                media: isValidImage(currentAd.media)
                  ? URL.createObjectURL(currentAd.media)
                  : ad.media,
              }

              previewDisclosure.onOpen()
            }}
          >
            <HStack>
              <TriangleUpIcon boxSize="3" transform="rotate(90deg)" />
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
