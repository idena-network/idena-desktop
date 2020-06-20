import React from 'react'
import {useRouter} from 'next/router'
import {Box, Code, Flex, useToast, Divider} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page} from '../../screens/app/components'
import {
  FlipMaster,
  FlipMasterFooter,
  FlipPageTitle,
  FlipMasterNavbar,
  FlipMasterNavbarItem,
  FlipStoryStep,
  FlipStepBody,
  FlipKeywordTranslationSwitch,
  CommunityTranslations,
  FlipKeywordPanel,
  FlipKeyword,
  FlipKeywordName,
  FlipStoryAside,
  FlipEditorStep,
  FlipShuffleStep,
  FlipSubmitStep,
} from '../../screens/flips/components'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {NotificationType} from '../../shared/providers/notification-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {flipMasterMachine} from '../../screens/flips/machines'
import {publishFlip, isPendingKeywordPair} from '../../screens/flips/utils/flip'
import {Notification} from '../../shared/components/notifications'
import {Step} from '../../screens/flips/types'
import {
  IconButton2,
  SecondaryButton,
  PrimaryButton,
} from '../../shared/components/button'

export default function EditFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {id} = router.query

  const toast = useToast()

  const {syncing} = useChainState()

  const {flipKeyWordPairs} = useIdentityState()

  const [current, send] = useMachine(flipMasterMachine, {
    context: {
      id,
      locale: i18n.language,
    },
    services: {
      // eslint-disable-next-line no-shadow
      prepareFlip: async ({id}) => {
        const persistedFlips = global.flipStore?.getFlips()

        const {
          pics,
          // eslint-disable-next-line no-shadow
          images = pics,
          hint,
          keywordPairId = hint ? Math.max(hint.id, 0) : 0,
          ...flip
        } = persistedFlips.find(({id: flipId}) => flipId === id)

        // eslint-disable-next-line no-shadow
        const availableKeywords = Array.isArray(flipKeyWordPairs)
          ? flipKeyWordPairs.filter(
              pair =>
                !pair.used && !isPendingKeywordPair(persistedFlips, pair.id)
            )
          : [{id: 0, words: flip.keywords.words.map(w => w.id)}]

        return {...flip, images, keywordPairId, availableKeywords}
      },
      submitFlip: async flip => publishFlip(flip),
    },
    actions: {
      onSubmitted: () => router.push('/flips/list'),
      onError: (_, {data, error = data.message}) =>
        toast({
          title: error,
          status: 'error',
          duration: 5000,
          isClosable: true,
          // eslint-disable-next-line react/display-name
          render: () => (
            <Box fontSize="md">
              <Notification
                title={error}
                type={NotificationType.Error}
                delay={5000}
              />
            </Box>
          ),
        }),
    },
  })

  const {
    availableKeywords,
    keywords,
    images,
    originalOrder,
    order,
    showTranslation,
    isCommunityTranslationsExpanded,
  } = current.context

  const not = state => !current?.matches({editing: state})
  const is = state => current?.matches({editing: state})

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
            {t('Edit flip')}
          </FlipPageTitle>
          {current.matches('editing') && (
            <FlipMaster>
              <FlipMasterNavbar>
                <FlipMasterNavbarItem
                  step={is('keywords') ? Step.Active : Step.Completed}
                  onClick={() => send('PICK_KEYWORDS')}
                >
                  {t('Think up a story')}
                </FlipMasterNavbarItem>
                <FlipMasterNavbarItem
                  step={
                    // eslint-disable-next-line no-nested-ternary
                    is('images')
                      ? Step.Active
                      : is('keywords')
                      ? Step.Next
                      : Step.Completed
                  }
                  onClick={() => send('PICK_IMAGES')}
                >
                  {t('Select images')}
                </FlipMasterNavbarItem>
                <FlipMasterNavbarItem
                  step={
                    // eslint-disable-next-line no-nested-ternary
                    is('shuffle')
                      ? Step.Active
                      : not('submit')
                      ? Step.Next
                      : Step.Completed
                  }
                  onClick={() => send('PICK_SHUFFLE')}
                >
                  {t('Shuffle images')}
                </FlipMasterNavbarItem>
                <FlipMasterNavbarItem
                  step={is('submit') ? Step.Active : Step.Next}
                  onClick={() => send('PICK_SUBMIT')}
                >
                  {t('Submit flip')}
                </FlipMasterNavbarItem>
              </FlipMasterNavbar>
              {is('keywords') && (
                <FlipStoryStep>
                  <FlipStepBody minH="180px">
                    <FlipKeywordPanel>
                      {is('keywords.loaded') && (
                        <>
                          <FlipKeywordTranslationSwitch
                            keywords={keywords}
                            showTranslation={showTranslation}
                            locale={i18n.language}
                            onSwitchLocale={() => send('SWITCH_LOCALE')}
                          />
                          <Divider
                            borderColor="gray.300"
                            mx={-10}
                            mt={4}
                            mb={6}
                          />
                          <CommunityTranslations
                            keywords={keywords}
                            onVote={e => send('VOTE', e)}
                            onSuggest={e => send('SUGGEST', e)}
                            isOpen={isCommunityTranslationsExpanded}
                            onToggle={() =>
                              send('TOGGLE_COMMUNITY_TRANSLATIONS')
                            }
                          />
                        </>
                      )}
                      {is('keywords.failure') && (
                        <FlipKeyword>
                          <FlipKeywordName>
                            {t('Missing keywords')}
                          </FlipKeywordName>
                        </FlipKeyword>
                      )}
                    </FlipKeywordPanel>
                    <FlipStoryAside>
                      <IconButton2
                        icon="refresh"
                        isDisabled={availableKeywords.length === 0}
                        onClick={() => send('CHANGE_KEYWORDS')}
                      >
                        {t('Change words')}
                      </IconButton2>
                    </FlipStoryAside>
                  </FlipStepBody>
                </FlipStoryStep>
              )}
              {is('images') && (
                <FlipEditorStep
                  keywords={keywords ? keywords.words : []}
                  originalOrder={originalOrder}
                  images={images}
                  onChangeImage={(image, currentIndex) =>
                    send('CHANGE_IMAGES', {image, currentIndex})
                  }
                  // eslint-disable-next-line no-shadow
                  onChangeOriginalOrder={order =>
                    send('CHANGE_ORIGINAL_ORDER', {order})
                  }
                  onPainting={() => send('PAINTING')}
                />
              )}
              {is('shuffle') && (
                <FlipShuffleStep
                  images={images}
                  originalOrder={originalOrder}
                  order={order}
                  onShuffle={() => send('SHUFFLE')}
                  onManualShuffle={nextOrder =>
                    send('MANUAL_SHUFFLE', {order: nextOrder})
                  }
                  onReset={() => send('RESET_SHUFFLE')}
                />
              )}
              {is('submit') && (
                <FlipSubmitStep
                  keywords={keywords}
                  showTranslation={showTranslation}
                  locale={i18n.language}
                  onSwitchLocale={() => send('SWITCH_LOCALE')}
                  originalOrder={originalOrder}
                  order={order}
                  images={images}
                />
              )}
            </FlipMaster>
          )}
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton onClick={() => send('PREV')}>
              {t('Previous step')}
            </SecondaryButton>
          )}
          {not('submit') && (
            <PrimaryButton
              isDisabled={is('images.painting')}
              onClick={() => send('NEXT')}
            >
              {t('Next step')}
            </PrimaryButton>
          )}
          {is('submit') && (
            <PrimaryButton onClick={() => send('SUBMIT')}>
              {t('Submit')}
            </PrimaryButton>
          )}
        </FlipMasterFooter>
      </Page>
      {global.isDev && (
        <Box position="absolute" left={6} bottom={6} zIndex="popover">
          <Code>{JSON.stringify(current.value)}</Code>
        </Box>
      )}
    </Layout>
  )
}
