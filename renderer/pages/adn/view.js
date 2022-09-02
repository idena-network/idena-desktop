import * as React from 'react'
import {Box, Flex, HStack, Stack, Text, useDisclosure} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {TriangleUpIcon} from '@chakra-ui/icons'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {
  PageHeader,
  PageCloseButton,
  PageFooter,
  AdImage,
} from '../../screens/ads/components'
import {useCoinbase, useIpfsAd} from '../../screens/ads/hooks'
import {ExternalLink} from '../../shared/components/components'
import {AdPreview} from '../../screens/ads/containers'

export default function ViewAdPage() {
  const {t} = useTranslation()

  const router = useRouter()

  const {data} = useIpfsAd(router.query?.cid)

  const coinbase = useCoinbase()

  const adPreviewDisclosure = useDisclosure()

  return (
    <Layout>
      <Page px={0} py={0} overflow="hidden">
        <Flex
          direction="column"
          flex={1}
          w="full"
          px={20}
          py={6}
          overflowY="auto"
        >
          <PageHeader>
            <PageTitle mb={0}>{t('View ad')}</PageTitle>
            <PageCloseButton href="/adn/list" />
          </PageHeader>

          <Flex align="center" flex={1}>
            {data ? (
              <HStack spacing="10" w="4xl">
                <Stack
                  flex={1}
                  alignSelf="stretch"
                  bg="gray.50"
                  rounded="lg"
                  px="10"
                  py="8"
                  maxH="md"
                >
                  <HStack spacing="4">
                    <AdImage src={data.thumb} width="20" />
                    <Box>
                      <Text fontSize="lg" fontWeight={500}>
                        {data.title}
                      </Text>
                      <Text fontWeight={500}>{data.desc}</Text>
                      <ExternalLink href={data.url}>{data.url}</ExternalLink>
                    </Box>
                  </HStack>
                </Stack>
                <Box flex={1}>
                  <AdImage src={data.media} />
                </Box>
              </HStack>
            ) : null}
          </Flex>
        </Flex>

        <PageFooter>
          <SecondaryButton
            onClick={() => {
              router.push('/adn/list')
            }}
          >
            {t('Close')}
          </SecondaryButton>
          <PrimaryButton onClick={adPreviewDisclosure.onOpen}>
            <HStack>
              <TriangleUpIcon boxSize="3" transform="rotate(90deg)" />
              <Text>{t('Show preview')}</Text>
            </HStack>
          </PrimaryButton>
        </PageFooter>
      </Page>

      <AdPreview
        ad={{...data, author: data?.author ?? coinbase}}
        {...adPreviewDisclosure}
      />
    </Layout>
  )
}
