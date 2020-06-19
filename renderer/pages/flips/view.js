import React from 'react'
import {useRouter} from 'next/router'
import {Box, Code, Flex, Stack} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page} from '../../screens/app/components'
import {
  FlipMaster,
  FlipPageTitle,
  FlipStepBody,
  FlipKeywordPanel,
  FlipKeywordTranslationSwitch,
  FlipKeyword,
  FlipKeywordName,
  FlipImageList,
  FlipImageListItem,
} from '../../screens/flips/components'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {createViewFlipMachine} from '../../screens/flips/machines'
import {rem} from '../../shared/theme'

export default function ViewFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {id} = router.query

  const {syncing} = useChainState()

  const viewMachine = React.useMemo(() => createViewFlipMachine(id), [id])

  const [current] = useMachine(viewMachine)

  const {
    keywords,
    images,
    originalOrder,
    order,
    showTranslation,
  } = current.context

  if (!id) return null

  return (
    <Layout syncing={syncing}>
      <Page p={0}>
        <Flex
          direction="column"
          flex={1}
          alignSelf="stretch"
          px={20}
          overflowY="auto"
        >
          <FlipPageTitle onClose={() => router.push('/flips/list')}>
            {t('View flip')}
          </FlipPageTitle>
          {current.matches('loaded') && (
            <FlipMaster>
              <FlipStepBody minH="180px" mt={8}>
                <Stack isInline spacing={10}>
                  <FlipKeywordPanel w={rem(320)}>
                    {keywords.words.length ? (
                      <FlipKeywordTranslationSwitch
                        keywords={keywords}
                        showTranslation={showTranslation}
                        voted={[]}
                        locale={i18n.language}
                      />
                    ) : (
                      <FlipKeyword>
                        <FlipKeywordName>
                          {t('Missing keywords')}
                        </FlipKeywordName>
                      </FlipKeyword>
                    )}
                  </FlipKeywordPanel>
                  <Stack isInline spacing={10} justify="center">
                    <FlipImageList>
                      {originalOrder.map((num, idx) => (
                        <FlipImageListItem
                          key={num}
                          src={images[num]}
                          isFirst={idx === 0}
                          isLast={idx === images.length - 1}
                        />
                      ))}
                    </FlipImageList>
                    <FlipImageList>
                      {order.map((num, idx) => (
                        <FlipImageListItem
                          key={num}
                          src={images[num]}
                          isFirst={idx === 0}
                          isLast={idx === images.length - 1}
                        />
                      ))}
                    </FlipImageList>
                  </Stack>
                </Stack>
              </FlipStepBody>
            </FlipMaster>
          )}
        </Flex>
      </Page>
      {global.isDev && (
        <Box position="absolute" left={6} bottom={6} zIndex="popover">
          <Code>{JSON.stringify(current.value)}</Code>
        </Box>
      )}
    </Layout>
  )
}
