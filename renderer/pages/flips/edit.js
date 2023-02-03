import React, {useEffect, useState} from 'react'
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
import {
  flipMasterMachine,
  imageSearchMachine,
} from '../../screens/flips/machines'
import {
  publishFlip,
  isPendingKeywordPair,
  protectFlip,
  checkIfFlipNoiseEnabled,
  prepareAdversarialImages,
  shuffleAdversarial,
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
import {useRpc, useTrackTx} from '../../screens/ads/hooks'
import {eitherState} from '../../shared/utils/utils'

export default function EditFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {id} = router.query

  const toast = useToast()

  const {syncing, offline} = useChainState()

  const {flipKeyWordPairs} = useIdentityState()

  const failToast = useFailToast()

  const [didShowShuffleAdversarial, setDidShowShuffleAdversarial] = useState(
    false
  )

  const [currentSearch, sendSearch] = useMachine(imageSearchMachine, {
    actions: {
      onError: () => {},
    },
  })

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
          // eslint-disable-next-line no-shadow
          protectedImages,
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

        return {
          ...flip,
          images,
          protectedImages,
          keywordPairId,
          availableKeywords,
          hint,
        }
      },
      protectFlip: async flip => protectFlip(flip),
      loadAdversarial: async flip => {
        if (
          !flip.adversarialImages.some(x => x) &&
          !eitherState(currentSearch, 'searching')
        ) {
          currentSearch.context.query = `${flip.keywords.words[0]?.name} ${flip.keywords.words[1]?.name}`
          sendSearch('SEARCH')
        }
        return Promise.resolve()
      },
      shuffleAdversarial: async flip =>
        shuffleAdversarial(flip, setDidShowShuffleAdversarial),
      submitFlip: async flip => publishFlip(flip),
    },
    actions: {
      onMined: () => {
        router.push('/flips/list')
      },
      onError: (
        _,
        {data, error = data.response?.data?.error ?? data.message}
      ) => failToast(error),
    },
  })

  useEffect(() => {
    if (eitherState(currentSearch, 'done')) {
      prepareAdversarialImages(
        currentSearch.context.images,
        send
      ).catch(() => {})
    }
  }, [currentSearch, send])

  const {
    availableKeywords,
    keywords,
    images,
    protectedImages,
    adversarialImages,
    adversarialImageId,
    originalOrder,
    order,
    showTranslation,
    isCommunityTranslationsExpanded,
    txHash,
    epochNumber,
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
    }, [send]),
  })

  useRpc('dna_epoch', [], {
    onSuccess: data => {
      send({type: 'SET_EPOCH_NUMBER', epochNumber: data.epoch})
    },
  })

  const isFlipNoiseEnabled = checkIfFlipNoiseEnabled(epochNumber)
  const maybeProtectedImages = isFlipNoiseEnabled ? protectedImages : images

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

                {isFlipNoiseEnabled ? (
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
                ) : null}
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
                  adversarialImageId={adversarialImageId}
                  onChangeImage={(image, currentIndex) =>
                    send('CHANGE_IMAGES', {image, currentIndex})
                  }
                  // eslint-disable-next-line no-shadow
                  onChangeOriginalOrder={order =>
                    send('CHANGE_ORIGINAL_ORDER', {order})
                  }
                  onPainting={() => send('PAINTING')}
                  onChangeAdversarialId={newIndex => {
                    send('CHANGE_ADVERSARIAL_ID', {newIndex})
                  }}
                />
              )}
              {is('protect') && (
                <FlipProtectStep
                  keywords={keywords}
                  showTranslation={showTranslation}
                  originalOrder={originalOrder}
                  images={images}
                  protectedImages={protectedImages}
                  adversarialImages={adversarialImages}
                  adversarialImageId={adversarialImageId}
                  didShowShuffleAdversarial={didShowShuffleAdversarial}
                  onProtecting={() => send('PROTECTING')}
                  onProtectImage={(image, currentIndex) =>
                    send('CHANGE_PROTECTED_IMAGES', {image, currentIndex})
                  }
                  onChangeAdversarial={image =>
                    send('CHANGE_ADVERSARIAL_IMAGE', {image})
                  }
                  onShowAdversarialShuffle={() =>
                    setDidShowShuffleAdversarial(true)
                  }
                />
              )}
              {is('shuffle') && (
                <FlipShuffleStep
                  images={maybeProtectedImages}
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
                  images={maybeProtectedImages}
                />
              )}
            </FlipMaster>
          )}
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton
              isDisabled={
                is('images.painting') ||
                is('protect.protecting') ||
                is('protect.shuffling') ||
                is('protect.preparing')
              }
              onClick={() => send('PREV')}
            >
              {t('Previous step')}
            </SecondaryButton>
          )}
          {not('submit') && (
            <PrimaryButton
              isDisabled={
                is('images.painting') ||
                is('protect.protecting') ||
                is('protect.shuffling') ||
                is('protect.preparing')
              }
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
          epochNum={epochNumber}
          onClose={onCloseBadFlipDialog}
        />

        <PublishFlipDrawer
          {...publishDrawerDisclosure}
          isPending={either('submit.submitting', 'submit.mining')}
          flip={{
            keywords: showTranslation ? keywords.translations : keywords.words,
            images: maybeProtectedImages,
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
