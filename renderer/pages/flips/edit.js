import React from 'react'
import {useRouter} from 'next/router'
import {Box, Code, Flex, Stack, Divider} from '@chakra-ui/core'
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
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {useEpochState} from '../../shared/providers/epoch-context'
import useFlips, {toHex} from '../../shared/hooks/use-flips'
import {FlipType} from '../../shared/types'
import {flipMasterMachine, flipEditMachine} from '../../screens/flips/machines'
import {rem} from '../../shared/theme'
import {submitFlip} from '../../shared/api'

export default function EditFlipPage() {
  const router = useRouter()
  const {id: flipId} = router.query

  const {flipKeyWordPairs: availableKeywords} = useIdentityState()

  const [currentEdit] = useMachine(flipEditMachine, {
    context: {id: flipId},
    services: {
      loadFlip: async ({id}) => global.flipStore.getFlip(id),
    },
  })

  if (!currentEdit.matches('loaded') || !availableKeywords) return null

  return (
    <FlipEditMaster
      availableKeywords={availableKeywords}
      {...currentEdit.context}
    />
  )
}

// eslint-disable-next-line react/prop-types
function FlipEditMaster({availableKeywords, ...flipContext}) {
  const {t, i18n} = useTranslation()

  const router = useRouter()

  const {syncing} = useChainState()

  const [current, send] = useMachine(flipMasterMachine, {
    context: {
      ...flipMasterMachine.context,
      ...flipContext,
      availableKeywords,
    },
    actions: {
      onSubmitted: () => router.push('/flips/list'),
    },
    services: {
      submitFlip: async ({keywordPairId, ...context}) => {
        if (keywordPairId < 0) {
          return {
            error: {message: 'Keywords for flip are not allowed'},
          }
        }

        // eslint-disable-next-line no-shadow
        const {images, order} = context
        const [publicHex, privateHex] = toHex(images, order)
        if (publicHex.length + privateHex.length > 2 * 1024 * 1024) {
          return {
            error: {message: 'Flip is too large'},
          }
        }

        const resp = await submitFlip(publicHex, privateHex, keywordPairId)
        const {result} = resp

        global.flipStore.updateDraft({
          ...context,
          ...result,
          type: FlipType.Publishing,
        })
        return resp
      },
    },
  })

  const {context} = current
  const {keywords, images, order} = context

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
            Edit flip
          </FlipPageTitle>
          <FlipMaster>
            <FlipMasterNavbar>
              <FlipMasterNavbarItem
                step={is('keywords') ? Step.Active : Step.Completed}
                onClick={() => send('PICK_KEYWORDS')}
              >
                Think up a story
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
                Select images
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
                Shuffle images
              </FlipMasterNavbarItem>
              <FlipMasterNavbarItem
                step={is('submit') ? Step.Active : Step.Next}
                onClick={() => send('PICK_SUBMIT')}
              >
                Submit flip
              </FlipMasterNavbarItem>
            </FlipMasterNavbar>
            {is('keywords') && (
              <FlipStoryStep>
                <FlipStepBody minH="180px">
                  <FlipKeywordPanel>
                    {is('keywords.done.origin') && (
                      <Stack spacing="30px">
                        <FlipKeywordPair>
                          {keywords.words.map(({id, name, desc}) => (
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
                            {i18n.language.toUpperCase()}
                          </IconButton2>
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
                                    .map(({name, desc}) => `${name}\n${desc}`)
                                    .join('\n')
                                )}`
                              )
                            }}
                          >
                            Google Translate
                          </IconButton2>
                        </Stack>
                      </Stack>
                    )}
                    {is('keywords.done.translated') && (
                      <>
                        <Stack spacing="30px">
                          <FlipKeywordPair>
                            {keywords.translations.map(([{id, name, desc}]) => (
                              <FlipKeyword key={id}>
                                <FlipKeywordName>{name}</FlipKeywordName>
                                <FlipKeywordDescription>
                                  {desc}
                                </FlipKeywordDescription>
                              </FlipKeyword>
                            ))}
                          </FlipKeywordPair>
                          <Box>
                            <IconButton2
                              icon="switch"
                              _hover={{background: 'transparent'}}
                              onClick={() => send('SWITCH_LOCALE')}
                            >
                              EN
                            </IconButton2>
                          </Box>
                        </Stack>
                        <Divider borderColor="gray.300" mx={-10} my={4} />
                        <CommunityTranslations
                          keywords={keywords}
                          onVote={e => send('VOTE', e)}
                          onSuggest={e => send('SUGGEST', e)}
                        />
                      </>
                    )}
                  </FlipKeywordPanel>
                  <FlipStoryAside>
                    <IconButton2
                      icon="refresh"
                      onClick={() => send('CHANGE_KEYWORDS')}
                    >
                      Change words
                    </IconButton2>
                  </FlipStoryAside>
                </FlipStepBody>
              </FlipStoryStep>
            )}
            {is('images') && (
              <FlipEditorStep
                keywords={keywords ? keywords.words : []}
                images={images}
                onChangeImage={(image, currentIndex) =>
                  send('CHANGE_IMAGES', {image, currentIndex})
                }
              />
            )}
            {is('shuffle') && (
              <FlipShuffleStep
                images={images}
                order={order}
                onShuffle={() => send('SHUFFLE')}
                onReset={() => send('RESET_SHUFFLE')}
              />
            )}
            {is('submit') && (
              <FlipSubmitStep>
                <FlipStepBody minH="180px">
                  <Stack isInline spacing={10}>
                    <FlipKeywordPanel w={rem(320)}>
                      {keywords && keywords.translations.length === 0 && (
                        <Stack spacing="30px">
                          <FlipKeywordPair>
                            {keywords.words.map(({id, name, desc}) => (
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
                              {i18n.language.toUpperCase()}
                            </IconButton2>
                            <Divider
                              orientation="vertical"
                              borderColor="gray.300"
                              m={0}
                              h={6}
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
                                      .map(({name, desc}) => `${name}\n${desc}`)
                                      .join('\n')
                                  )}`
                                )
                              }}
                            >
                              Google Translate
                            </IconButton2>
                          </Stack>
                        </Stack>
                      )}
                      {keywords && keywords.translations.length > 0 && (
                        <>
                          <Stack spacing="30px">
                            <FlipKeywordPair>
                              {keywords.translations.map(
                                ([{id, name, desc}]) => (
                                  <FlipKeyword key={id}>
                                    <FlipKeywordName>{name}</FlipKeywordName>
                                    <FlipKeywordDescription>
                                      {desc}
                                    </FlipKeywordDescription>
                                  </FlipKeyword>
                                )
                              )}
                            </FlipKeywordPair>
                            <Box>
                              <IconButton2
                                icon="switch"
                                _hover={{background: 'transparent'}}
                                onClick={() => send('SWITCH_LOCALE')}
                              >
                                EN
                              </IconButton2>
                            </Box>
                          </Stack>
                        </>
                      )}
                    </FlipKeywordPanel>
                    <Stack isInline spacing={10} justify="center">
                      <FlipImageList>
                        {images.map(src => (
                          <FlipImageListItem key={src} src={src} />
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
          <Box position="absolute" left={6} bottom={6}>
            <Code>{JSON.stringify({})}</Code>
          </Box>
        </Flex>
        <FlipMasterFooter>
          {not('keywords') && (
            <SecondaryButton onClick={() => send('PREV')}>
              Prev step
            </SecondaryButton>
          )}
          {not('submit') && (
            <PrimaryButton onClick={() => send('NEXT')}>
              Next step
            </PrimaryButton>
          )}
          {is('submit') && (
            <PrimaryButton onClick={() => send('SUBMIT')}>Submit</PrimaryButton>
          )}
        </FlipMasterFooter>
        <Box position="absolute" left={6} bottom={6} zIndex="modal">
          <Code>{JSON.stringify(current.value)}</Code>
        </Box>
      </Page>
    </Layout>
  )
}
