import React from 'react'
import {useRouter} from 'next/router'
import {Box, Code, Flex, Stack, Divider, useToast} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page} from '../../screens/app/components'
import {
  FlipMaster,
  FlipMasterNavbar,
  FlipMasterNavbarItem,
  FlipStoryStep,
  FlipMasterFooter,
  FlipStepBody,
  FlipKeywordPair,
  FlipKeyword,
  FlipStoryAside,
  FlipKeywordPanel,
  FlipKeywordName,
  FlipKeywordDescription,
  FlipPageTitle,
  FlipEditorStep,
  FlipShuffleStep,
  FlipSubmitStep,
  CommunityTranslations,
  FlipImageList,
  FlipImageListItem,
} from '../../screens/flips/components'
import {Step} from '../../screens/flips/types'
import {
  SecondaryButton,
  PrimaryButton,
  IconButton2,
} from '../../shared/components/button'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {NotificationType} from '../../shared/providers/notification-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {flipMasterMachine} from '../../screens/flips/machines'
import {rem} from '../../shared/theme'
import {publishFlip} from '../../screens/flips/utils/flip'
import {Notification} from '../../shared/components/notifications'

export default function NewFlipPage() {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const toast = useToast()

  const {syncing} = useChainState()

  const {flipKeyWordPairs: availableKeywords} = useIdentityState()

  const [{id: keywordPairId}] =
    availableKeywords && availableKeywords.length
      ? availableKeywords.filter(({used}) => !used)
      : [
          {
            id: 0,
          },
        ]

  const [current, send] = useMachine(flipMasterMachine, {
    context: {
      ...flipMasterMachine.context,
      availableKeywords,
      keywordPairId,
      images: Array.from({length: 4}),
      locale: i18n.language,
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
    services: {
      submitFlip: async flip => publishFlip(flip),
    },
  })

  const {context} = current
  const {keywords, images, originalOrder, order, showTranslation} = context

  const not = state => !current.matches({editing: state})
  const is = state => current.matches({editing: state})

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
            New flip
          </FlipPageTitle>
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
                    {is('keywords.done') && (
                      <Stack spacing="30px">
                        <FlipKeywordPair>
                          {showTranslation &&
                            keywords.translations.map(([{id, name, desc}]) => (
                              <FlipKeyword key={id}>
                                <FlipKeywordName>{name}</FlipKeywordName>
                                <FlipKeywordDescription>
                                  {desc}
                                </FlipKeywordDescription>
                              </FlipKeyword>
                            ))}
                          {showTranslation ||
                            keywords.words.map(({id, name, desc}) => (
                              <FlipKeyword key={id}>
                                <FlipKeywordName>{name}</FlipKeywordName>
                                <FlipKeywordDescription>
                                  {desc}
                                </FlipKeywordDescription>
                              </FlipKeyword>
                            ))}
                        </FlipKeywordPair>
                        <Stack isInline spacing={1} align="center">
                          <IconButton2
                            icon="switch"
                            _hover={{background: 'transparent'}}
                            onClick={() => send('SWITCH_LOCALE')}
                          >
                            {showTranslation
                              ? 'EN'
                              : i18n.language.toUpperCase()}
                          </IconButton2>
                          {showTranslation || (
                            <>
                              <Divider
                                orientation="vertical"
                                borderColor="gray.300"
                                m={0}
                                h={rem(24)}
                              />
                              <IconButton2
                                icon="gtranslate"
                                _hover={{background: 'transparent'}}
                                onClick={() => {
                                  global.openExternal(
                                    `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${
                                      global.locale
                                    }&text=${encodeURIComponent(
                                      keywords.words
                                        .map(
                                          ({name, desc}) => `${name}\n${desc}`
                                        )
                                        .join('\n')
                                    )}`
                                  )
                                }}
                              >
                                Google Translate
                              </IconButton2>
                            </>
                          )}
                        </Stack>
                        <Divider borderColor="gray.300" mx={-10} my={4} />
                        <CommunityTranslations
                          keywords={keywords}
                          onVote={e => send('VOTE', e)}
                          onSuggest={e => send('SUGGEST', e)}
                        />
                      </Stack>
                    )}
                  </FlipKeywordPanel>
                  <FlipStoryAside>
                    <IconButton2
                      icon="refresh"
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
              <FlipSubmitStep>
                <FlipStepBody minH="180px">
                  <Stack isInline spacing={10}>
                    <FlipKeywordPanel w={rem(320)}>
                      {is('submit.idle') && (
                        <Stack spacing="30px">
                          <FlipKeywordPair>
                            {showTranslation &&
                              keywords.translations.map(
                                ([{id, name, desc}]) => (
                                  <FlipKeyword key={id}>
                                    <FlipKeywordName>{name}</FlipKeywordName>
                                    <FlipKeywordDescription>
                                      {desc}
                                    </FlipKeywordDescription>
                                  </FlipKeyword>
                                )
                              )}
                            {showTranslation ||
                              keywords.words.map(({id, name, desc}) => (
                                <FlipKeyword key={id}>
                                  <FlipKeywordName>{name}</FlipKeywordName>
                                  <FlipKeywordDescription>
                                    {desc}
                                  </FlipKeywordDescription>
                                </FlipKeyword>
                              ))}
                          </FlipKeywordPair>
                          <Stack isInline spacing={1} align="center">
                            <IconButton2
                              icon="switch"
                              _hover={{background: 'transparent'}}
                              onClick={() => send('SWITCH_LOCALE')}
                            >
                              {showTranslation
                                ? 'EN'
                                : i18n.language.toUpperCase()}
                            </IconButton2>
                            {showTranslation || (
                              <>
                                <Divider
                                  orientation="vertical"
                                  borderColor="gray.300"
                                  m={0}
                                  h={rem(24)}
                                />
                                <IconButton2
                                  icon="gtranslate"
                                  _hover={{background: 'transparent'}}
                                  onClick={() => {
                                    global.openExternal(
                                      `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${
                                        global.locale
                                      }&text=${encodeURIComponent(
                                        keywords.words
                                          .map(
                                            ({name, desc}) => `${name}\n${desc}`
                                          )
                                          .join('\n')
                                      )}`
                                    )
                                  }}
                                >
                                  Google Translate
                                </IconButton2>
                              </>
                            )}
                          </Stack>
                        </Stack>
                      )}
                    </FlipKeywordPanel>
                    <Stack isInline spacing={10} justify="center">
                      <FlipImageList>
                        {originalOrder.map(num => (
                          <FlipImageListItem key={num} src={images[num]} />
                        ))}
                      </FlipImageList>
                      <FlipImageList>
                        {order.map(idx => (
                          <FlipImageListItem key={idx} src={images[idx]} />
                        ))}
                      </FlipImageList>
                    </Stack>
                  </Stack>
                </FlipStepBody>
              </FlipSubmitStep>
            )}
          </FlipMaster>
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton onClick={() => send('PREV')}>
              {t('Prev step')}
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
        <Box position="absolute" left={6} bottom={6} zIndex="modal">
          <Code>{JSON.stringify(current.value)}</Code>
        </Box>
      )}
    </Layout>
  )
}
