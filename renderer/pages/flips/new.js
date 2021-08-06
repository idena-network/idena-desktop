import React from 'react'
import {useRouter} from 'next/router'
import {Box, Flex, useToast, Divider, useDisclosure} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page} from '../../screens/app/components'
import {
  FlipMasterFooter,
  FlipPageTitle,
  FlipMaster,
  FlipMasterNavbar,
  FlipMasterNavbarItem,
  FlipStoryStep,
  FlipStepBody,
  FlipKeywordPanel,
  FlipKeywordTranslationSwitch,
  CommunityTranslations,
  FlipKeyword,
  FlipKeywordName,
  FlipStoryAside,
  FlipEditorStep,
  FlipShuffleStep,
  FlipSubmitStep,
  CommunityTranslationUnavailable,
} from '../../screens/flips/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {flipMasterMachine} from '../../screens/flips/machines'
import {
  publishFlip,
  isPendingKeywordPair,
  getRandomKeywordPair,
} from '../../screens/flips/utils'
import {Step} from '../../screens/flips/types'
import {
  IconButton2,
  SecondaryButton,
  PrimaryButton,
} from '../../shared/components/button'
import {Toast, FloatDebug} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {BadFlipDialog} from '../../screens/validation/components'
import {requestDb} from '../../shared/utils/db'
import {useFailToast} from '../../shared/hooks/use-toast'

export default function NewFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const toast = useToast()

  const {syncing} = useChainState()
  const {flipKeyWordPairs} = useIdentityState()

  const failToast = useFailToast()

  const [current, send] = useMachine(flipMasterMachine, {
    context: {
      locale: i18n.language,
    },
    services: {
      prepareFlip: async () => {
        // eslint-disable-next-line no-shadow
        let didShowBadFlip

        try {
          didShowBadFlip = await global
            .sub(requestDb(), 'flips')
            .get('didShowBadFlip')
        } catch {
          didShowBadFlip = false
        }

        if (
          flipKeyWordPairs === null ||
          flipKeyWordPairs.every(({used}) => used)
        )
          return {
            keywordPairId: 0,
            availableKeywords: [getRandomKeywordPair()],
            didShowBadFlip,
          }

        const persistedFlips = global.flipStore?.getFlips()

        // eslint-disable-next-line no-shadow
        const availableKeywords = flipKeyWordPairs.filter(
          ({id, used}) => !used && !isPendingKeywordPair(persistedFlips, id)
        )

        // eslint-disable-next-line no-shadow
        const [{id: keywordPairId}] = availableKeywords

        return {keywordPairId, availableKeywords, didShowBadFlip}
      },
      submitFlip: async flip => publishFlip(flip),
    },
    actions: {
      onSubmitted: () => router.push('/flips/list'),
      onError: (
        _,
        {data, error = data.response?.data?.error ?? data.message}
      ) => {
        failToast(
          data.response?.status === 413
            ? t('Cannot submit flip, content is too big')
            : error
        )
      },
    },
  })

  const {
    availableKeywords,
    keywordPairId,
    keywords,
    images,
    originalOrder,
    order,
    showTranslation,
    isCommunityTranslationsExpanded,
    didShowBadFlip,
  } = current.context

  const not = state => !current.matches({editing: state})
  const is = state => current.matches({editing: state})

  const isOffline = is('keywords.loaded.fetchTranslationsFailed')

  const {
    isOpen: isOpenBadFlipDialog,
    onOpen: onOpenBadFlipDialog,
    onClose: onCloseBadFlipDialog,
  } = useDisclosure()

  return (
    <Layout syncing={syncing}>
      <Page p={0}>
        <Flex
          direction="column"
          flex={1}
          alignSelf="stretch"
          px={20}
          pb={rem(36)}
          overflowY="auto"
        >
          <FlipPageTitle
            onClose={() => {
              if (images.some(x => x))
                toast({
                  status: 'success',
                  // eslint-disable-next-line react/display-name
                  render: () => (
                    <Toast title={t('Flip has been saved to drafts')} />
                  ),
                })
              router.push('/flips/list')
            }}
          >
            {t('New flip')}
          </FlipPageTitle>
          {current.matches('editing') && (
            <FlipMaster>
              <FlipMasterNavbar>
                <FlipMasterNavbarItem
                  step={is('keywords') ? Step.Active : Step.Completed}
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
                >
                  {t('Shuffle images')}
                </FlipMasterNavbarItem>
                <FlipMasterNavbarItem
                  step={is('submit') ? Step.Active : Step.Next}
                >
                  {t('Submit flip')}
                </FlipMasterNavbarItem>
              </FlipMasterNavbar>
              {is('keywords') && (
                <FlipStoryStep>
                  <FlipStepBody minH="180px">
                    <Box>
                      <FlipKeywordPanel>
                        {is('keywords.loaded') && (
                          <>
                            <FlipKeywordTranslationSwitch
                              keywords={keywords}
                              showTranslation={showTranslation}
                              locale={i18n.language}
                              onSwitchLocale={() => send('SWITCH_LOCALE')}
                            />
                            {(i18n.language || 'en').toUpperCase() !== 'EN' &&
                              !isOffline && (
                                <>
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
                                    isPending={is(
                                      'keywords.loaded.fetchedTranslations.suggesting'
                                    )}
                                    onToggle={() =>
                                      send('TOGGLE_COMMUNITY_TRANSLATIONS')
                                    }
                                  />
                                </>
                              )}
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
                      {isOffline && <CommunityTranslationUnavailable />}
                    </Box>
                    <FlipStoryAside>
                      <IconButton2
                        icon="refresh"
                        isDisabled={availableKeywords.length < 2}
                        onClick={() => send('CHANGE_KEYWORDS')}
                      >
                        {t('Change words')}{' '}
                        {availableKeywords.length > 1
                          ? `(#${keywordPairId + 1})`
                          : null}
                      </IconButton2>
                      <IconButton2 icon="info" onClick={onOpenBadFlipDialog}>
                        {t('What is a bad flip')}
                      </IconButton2>
                    </FlipStoryAside>
                  </FlipStepBody>
                </FlipStoryStep>
              )}
              {is('images') && (
                <FlipEditorStep
                  keywords={keywords}
                  showTranslation={showTranslation}
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
            <SecondaryButton
              isDisabled={is('images.painting')}
              onClick={() => send('PREV')}
            >
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
            <PrimaryButton
              isDisabled={is('submit.submitting')}
              isLoading={is('submit.submitting')}
              loadingText={t('Publishing')}
              onClick={() => send('SUBMIT')}
            >
              {t('Submit')}
            </PrimaryButton>
          )}
        </FlipMasterFooter>

        <BadFlipDialog
          isOpen={isOpenBadFlipDialog || !didShowBadFlip}
          title={t('What is a bad flip?')}
          subtitle={t(
            'Please read the rules carefully. You can lose all your validation rewards if any of your flips is reported.'
          )}
          onClose={async () => {
            await global.sub(requestDb(), 'flips').put('didShowBadFlip', 1)
            send('SKIP_BAD_FLIP')
            onCloseBadFlipDialog()
          }}
        />

        {global.isDev && (
          <FloatDebug>{JSON.stringify(current.value)}</FloatDebug>
        )}
      </Page>
    </Layout>
  )
}
