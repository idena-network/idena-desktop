import React from 'react'
import {useRouter} from 'next/router'
import {Box, Flex, useToast, Divider, useDisclosure} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
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
  CommunityTranslationUnavailable,
  PublishFlipDrawer,
  FlipProtectStep,
} from '../../screens/flips/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {flipMasterMachine} from '../../screens/flips/machines'
import {
  publishFlip,
  isPendingKeywordPair,
  protectFlip,
} from '../../screens/flips/utils'
import {Step} from '../../screens/flips/types'
import {
  IconButton2,
  SecondaryButton,
  PrimaryButton,
} from '../../shared/components/button'
import {FloatDebug, Page, Toast} from '../../shared/components/components'
import Layout from '../../shared/components/layout'
import {BadFlipDialog} from '../../screens/validation/components'
import {useFailToast} from '../../shared/hooks/use-toast'
import {useChainState} from '../../shared/providers/chain-context'
import {InfoIcon, RefreshIcon} from '../../shared/components/icons'
import {useTrackTx} from '../../screens/ads/hooks'
import {eitherState} from '../../shared/utils/utils'

export default function EditFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {id} = router.query

  const toast = useToast()

  const {syncing, offline} = useChainState()

  const {flipKeyWordPairs} = useIdentityState()

  const failToast = useFailToast()

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
          compressedPics,
          // eslint-disable-next-line no-shadow
          images = compressedPics || pics,
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

        return {...flip, images, keywordPairId, availableKeywords, hint}
      },
      protectFlip: async flip => protectFlip(flip),
      submitFlip: async flip => publishFlip(flip),
    },
    actions: {
      onSubmitted: () => router.push('/flips/list'),
      onError: (
        _,
        {data, error = data.response?.data?.error ?? data.message}
      ) => failToast(error),
    },
  })

  const {
    availableKeywords,
    keywords,
    images,
    protectedImages,
    originalOrder,
    order,
    showTranslation,
    isCommunityTranslationsExpanded,
    txHash,
  } = current.context

  const not = state => !current?.matches({editing: state})
  const is = state => current?.matches({editing: state})
  const either = (...states) =>
    eitherState(current, ...states.map(s => ({editing: s})))

  const isOffline = is('keywords.loaded.fetchTranslationsFailed')

  const {
    isOpen: isOpenBadFlipDialog,
    onOpen: onOpenBadFlipDialog,
    onClose: onCloseBadFlipDialog,
  } = useDisclosure()

  const publishDrawerDisclosure = useDisclosure()

  useTrackTx(txHash, {
    onMined: React.useCallback(() => {
      send({type: 'FLIP_MINED'})
      router.push('/flips/list')
    }, [router, send]),
  })

  return (
    <Layout>
      <Page p={0}>
        <Flex
          direction="column"
          flex={1}
          alignSelf="stretch"
          px={20}
          pb="36px"
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
            {t('Edit flip')}
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
                    is('protect')
                      ? Step.Active
                      : is('keywords') || is('images')
                      ? Step.Next
                      : Step.Completed
                  }
                >
                  {t('Protect images')}
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
                        icon={<RefreshIcon />}
                        isDisabled={availableKeywords.length === 0}
                        onClick={() => send('CHANGE_KEYWORDS')}
                      >
                        {t('Change words')}
                      </IconButton2>
                      <IconButton2
                        icon={<InfoIcon />}
                        onClick={onOpenBadFlipDialog}
                      >
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
              {is('protect') && (
                <FlipProtectStep
                  keywords={keywords}
                  showTranslation={showTranslation}
                  originalOrder={originalOrder}
                  images={images}
                  protectedImages={protectedImages}
                  onProtecting={() => send('PROTECTING')}
                  onProtectImage={(image, currentIndex) =>
                    send('CHANGE_PROTECTED_IMAGES', {image, currentIndex})
                  }
                />
              )}
              {is('shuffle') && (
                <FlipShuffleStep
                  images={protectedImages}
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
                  images={protectedImages}
                />
              )}
            </FlipMaster>
          )}
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton
              isDisabled={is('images.painting') || is('protect.protecting')}
              onClick={() => send('PREV')}
            >
              {t('Previous step')}
            </SecondaryButton>
          )}
          {not('submit') && (
            <PrimaryButton
              isDisabled={is('images.painting') || is('protect.protecting')}
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
              onClick={() => {
                if (syncing) {
                  failToast('Can not submit flip while node is synchronizing')
                  return
                }
                if (offline) {
                  failToast('Can not submit flip. Node is offline')
                  return
                }
                publishDrawerDisclosure.onOpen()
              }}
            >
              {t('Submit')}
            </PrimaryButton>
          )}
        </FlipMasterFooter>

        <BadFlipDialog
          isOpen={isOpenBadFlipDialog}
          title={t('What is a bad flip?')}
          subtitle={t(
            'Please read the rules carefully. You can lose all your validation rewards if any of your flips is reported.'
          )}
          onClose={onCloseBadFlipDialog}
        />

        <PublishFlipDrawer
          {...publishDrawerDisclosure}
          isPending={either('submit.submitting', 'submit.mining')}
          flip={{
            keywords: showTranslation ? keywords.translations : keywords.words,
            protectedImages,
            originalOrder,
            order,
          }}
          onSubmit={() => {
            send('SUBMIT')
          }}
        />

        {global.isDev && <FloatDebug>{current.value}</FloatDebug>}
      </Page>
    </Layout>
  )
}
