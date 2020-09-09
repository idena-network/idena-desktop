/* eslint-disable react/prop-types */
import {useMachine} from '@xstate/react'
import {useMemo, useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import {padding, margin} from 'polished'
import {FiCheck} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'
import {
  Flex as ChakraFlex,
  Text as ChakraText,
  IconButton,
  useToast,
} from '@chakra-ui/core'
import {
  createValidationMachine,
  RelevanceType,
} from '../../screens/validation/machine'
import {
  persistValidationState,
  loadValidationState,
  filterRegularFlips,
  filterSolvableFlips,
  rearrangeFlips,
  readyFlip,
  availableFlipReportsNumber,
} from '../../screens/validation/utils'
import {
  ValidationScene,
  ActionBar,
  Thumbnails,
  Header,
  Title,
  FlipChallenge,
  CurrentStep,
  Flip,
  ActionBarItem,
  Thumbnail,
  FlipWords,
  NavButton,
  QualificationActions,
  QualificationButton,
  WelcomeQualificationDialog,
  WelcomeKeywordsQualificationDialog,
  ValidationTimer,
  ValidationFailedDialog,
  ValidationSucceededDialog,
  SubmitFailedDialog,
  FailedFlipAnnotation,
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {Tooltip, Box, Text} from '../../shared/components'
import {AnswerType} from '../../shared/types'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useTimingState} from '../../shared/providers/timing-context'
import {addWheelHandler} from '../../shared/utils/mouse'
import Flex from '../../shared/components/flex'
import {PrimaryButton} from '../../shared/components/button'
import {FloatDebug, Toast} from '../../shared/components/components'

export default function ValidationPage() {
  const epoch = useEpochState()
  const timing = useTimingState()

  // TODO: move zoom handler to the Page component, which allows for setting layout as a static Page prop
  const [zoomLevel, setZoomLevel] = useState(0)
  useEffect(() => addWheelHandler(setZoomLevel), [])
  useEffect(() => {
    global.setZoomLevel(zoomLevel)
  }, [zoomLevel])

  if (epoch && timing && timing.shortSession)
    return (
      <ValidationSession
        epoch={epoch.epoch}
        validationStart={new Date(epoch.nextValidation).getTime()}
        shortSessionDuration={timing.shortSession}
        longSessionDuration={timing.longSession}
      />
    )

  return null
}

function ValidationSession({
  epoch,
  validationStart,
  shortSessionDuration,
  longSessionDuration,
}) {
  const {i18n} = useTranslation()

  const toast = useToast()

  const validationMachine = useMemo(
    () =>
      createValidationMachine({
        epoch,
        validationStart,
        shortSessionDuration,
        longSessionDuration,
        locale: i18n.language || 'en',
      }),
    [
      epoch,
      i18n.language,
      longSessionDuration,
      shortSessionDuration,
      validationStart,
    ]
  )
  const [state, send] = useMachine(validationMachine, {
    actions: {
      onExceedReportedFlips: () => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title="Please remove Report status from some other flips to continue"
              status="error"
            />
          ),
        })
      },
      onFirstReportedFlip: () =>
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title="You'll get a reward if the flip is reported by other participants" />
          ),
        }),
    },
    state: loadValidationState(),
    logger: global.isDev
      ? console.log
      : (...args) => global.logger.debug(...args),
  })

  const {currentIndex, translations, reportedFlipsCount} = state.context

  const router = useRouter()

  useEffect(() => {
    persistValidationState(state)
  }, [state])

  const currentFlip = sessionFlips(state)[currentIndex]

  const {t} = useTranslation()

  return (
    <ValidationScene
      bg={isShortSession(state) ? theme.colors.black : theme.colors.white}
    >
      <Header>
        <Title color={isShortSession(state) ? 'white' : 'brandGray.500'}>
          {['shortSession', 'longSession'].some(state.matches) &&
          !isLongSessionKeywords(state)
            ? t('Select meaningful story: left or right', {nsSeparator: '!'})
            : t('Check flips quality')}
        </Title>
        <ChakraFlex align="center">
          <Title
            color={isShortSession(state) ? 'white' : 'brandGray.500'}
            mr={6}
          >
            {currentIndex + 1}{' '}
            <ChakraText as="span" color="muted">
              out of {sessionFlips(state).length}
            </ChakraText>
          </Title>

          <IconButton
            icon="fullscreen"
            bg={isShortSession(state) ? 'brandGray.060' : 'gray.300'}
            color={isShortSession(state) ? 'white' : 'brandGray.500'}
            borderRadius="lg"
            fontSize={rem(20)}
            w={10}
            h={10}
            _hover={{
              bg: isShortSession(state) ? 'brandGray.060' : 'gray.300',
            }}
            onClick={global.toggleFullScreen}
          />
        </ChakraFlex>
      </Header>
      <CurrentStep>
        <FlipChallenge>
          <Flex justify="center" align="center" css={{position: 'relative'}}>
            {currentFlip &&
              ((currentFlip.fetched && !currentFlip.decoded) ||
                currentFlip.failed) && (
                <FailedFlipAnnotation>
                  {t('No data available. Please skip the flip.')}
                </FailedFlipAnnotation>
              )}
            <Flip
              {...currentFlip}
              variant={AnswerType.Left}
              onChoose={hash =>
                send({
                  type: 'ANSWER',
                  hash,
                  option: AnswerType.Left,
                })
              }
            />
            <Flip
              {...currentFlip}
              variant={AnswerType.Right}
              onChoose={hash =>
                send({
                  type: 'ANSWER',
                  hash,
                  option: AnswerType.Right,
                })
              }
              onImageFail={() => send('REFETCH_FLIPS')}
            />
          </Flex>
          {(isLongSessionKeywords(state) ||
            state.matches('validationSucceeded')) &&
            currentFlip && (
              <FlipWords
                key={currentFlip.hash}
                currentFlip={currentFlip}
                translations={translations}
              >
                {currentFlip.words?.length ? (
                  <QualificationActions>
                    <QualificationButton
                      flip={currentFlip}
                      variant={RelevanceType.Relevant}
                      onVote={hash =>
                        send({
                          type: 'TOGGLE_WORDS',
                          hash,
                          relevance: RelevanceType.Relevant,
                        })
                      }
                    >
                      {currentFlip.relevance === RelevanceType.Relevant && (
                        <FiCheck size={rem(16)} fontSize={rem(13)} />
                      )}
                      {t('Both relevant')}
                    </QualificationButton>
                    <Tooltip
                      content={
                        <Box
                          w={rem(350)}
                          css={{
                            ...padding(rem(theme.spacings.medium16)),
                            wordWrap: 'break-word',
                            wordBreak: 'keep-all',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          <Text
                            color={theme.colors.white}
                            fontSize={theme.fontSizes.large}
                            fontWeight="500"
                            css={{
                              ...margin(0, 0, rem(theme.spacings.small12)),
                            }}
                          >
                            Please also report the flip when you see one of the
                            following:
                          </Text>
                          <Box color={theme.colors.white} w={rem(350)}>
                            {[
                              '1. You need to read the text in the flip to solve it',
                              '2. You see inappropriate content',
                              '3. You see numbers or letters or other labels on top of the images showing their order',
                            ].map(phrase => (
                              <Box
                                css={{
                                  fontSize: theme.fontSizes.normal,
                                  ...margin(0, 0, rem(theme.spacings.small12)),
                                }}
                              >
                                {phrase}
                              </Box>
                            ))}
                          </Box>
                          <Text color={theme.colors.muted}>
                            Skip the flip if the keywords are not loaded
                          </Text>
                        </Box>
                      }
                    >
                      <QualificationButton
                        flip={currentFlip}
                        variant={RelevanceType.Irrelevant}
                        onVote={hash =>
                          send({
                            type: 'TOGGLE_WORDS',
                            hash,
                            relevance: RelevanceType.Irrelevant,
                          })
                        }
                      >
                        {currentFlip.relevance === RelevanceType.Irrelevant && (
                          <FiCheck size={rem(16)} fontSize={rem(13)} />
                        )}
                        <ChakraText>
                          {t('Report')} (
                          {availableFlipReportsNumber(sessionFlips(state)) -
                            reportedFlipsCount}{' '}
                          left)
                        </ChakraText>
                      </QualificationButton>
                    </Tooltip>
                  </QualificationActions>
                ) : (
                  <ChakraText color="red.500" fontWeight={500}>
                    Flip keywords will be reported as irrelevant
                  </ChakraText>
                )}
              </FlipWords>
            )}
        </FlipChallenge>
      </CurrentStep>
      <ActionBar>
        <ActionBarItem />
        <ActionBarItem justify="center">
          <ValidationTimer
            validationStart={validationStart}
            duration={
              shortSessionDuration -
              10 +
              (isShortSession(state) ? 0 : longSessionDuration)
            }
          />
        </ActionBarItem>
        <ActionBarItem justify="flex-end">
          {(isShortSession(state) || isLongSessionKeywords(state)) && (
            <Tooltip
              content={
                hasAllRelevanceMarks(state) || isLastFlip(state)
                  ? null
                  : t('Go to last flip')
              }
            >
              <PrimaryButton
                isDisabled={!canSubmit(state)}
                isLoading={isSubmitting(state)}
                loadingText={t('Submitting answers...')}
                onClick={() => send('SUBMIT')}
              >
                {t('Submit answers')}
              </PrimaryButton>
            </Tooltip>
          )}
          {isLongSessionFlips(state) && (
            <PrimaryButton
              isDisabled={!canSubmit(state)}
              onClick={() => send('FINISH_FLIPS')}
            >
              {t('Start checking keywords')}
            </PrimaryButton>
          )}
        </ActionBarItem>
      </ActionBar>
      <Thumbnails currentIndex={currentIndex}>
        {sessionFlips(state).map((flip, idx) => (
          <Thumbnail
            key={flip.hash}
            {...flip}
            isCurrent={currentIndex === idx}
            onPick={() => send({type: 'PICK', index: idx})}
          />
        ))}
      </Thumbnails>
      {!isFirstFlip(state) &&
        hasManyFlips(state) &&
        isSolving(state) &&
        !isSubmitting(state) && (
          <NavButton
            type="prev"
            bg={
              isShortSession(state) ? theme.colors.white01 : theme.colors.gray
            }
            color={
              isShortSession(state) ? theme.colors.white : theme.colors.text
            }
            onClick={() => send({type: 'PREV'})}
          />
        )}
      {!isLastFlip(state) &&
        hasManyFlips(state) &&
        isSolving(state) &&
        !isSubmitting(state) && (
          <NavButton
            type="next"
            bg={
              isShortSession(state) ? theme.colors.white01 : theme.colors.gray
            }
            color={
              isShortSession(state) ? theme.colors.white : theme.colors.text
            }
            onClick={() => send({type: 'NEXT'})}
          />
        )}
      {isSubmitFailed(state) && (
        <SubmitFailedDialog isOpen onSubmit={() => send('RETRY_SUBMIT')} />
      )}

      {state.matches('longSession.solve.answer.welcomeQualification') && (
        <WelcomeQualificationDialog
          isOpen
          onSubmit={() => send('START_LONG_SESSION')}
        />
      )}
      {state.matches('longSession.solve.answer.finishFlips') && (
        <WelcomeKeywordsQualificationDialog
          isOpen
          onSubmit={() => send('START_KEYWORDS_QUALIFICATION')}
        />
      )}

      {state.matches('validationSucceeded') && (
        <ValidationSucceededDialog
          isOpen
          onSubmit={() => router.push('/profile')}
        />
      )}

      {state.matches('validationFailed') && (
        <ValidationFailedDialog
          isOpen
          onSubmit={() => router.push('/profile')}
        />
      )}

      {global.isDev && <FloatDebug>{state.value}</FloatDebug>}
    </ValidationScene>
  )
}

function isShortSession(state) {
  return state.matches('shortSession')
}

function isLongSessionFlips(state) {
  return ['flips', 'finishFlips']
    .map(substate => `longSession.solve.answer.${substate}`)
    .some(state.matches)
}

function isLongSessionKeywords(state) {
  return ['keywords', 'submitLongSession']
    .map(substate => `longSession.solve.answer.${substate}`)
    .some(state.matches)
}

function isSolving(state) {
  return ['shortSession', 'longSession'].some(state.matches)
}

function isSubmitting(state) {
  return [
    'shortSession.solve.answer.submitShortSession',
    'longSession.solve.answer.finishFlips',
    'longSession.solve.answer.submitLongSession',
  ].some(state.matches)
}

function isSubmitFailed(state) {
  return [
    ['shortSession', 'submitShortSession'],
    ['longSession', 'submitLongSession'],
  ]
    .map(([state1, state2]) => `${state1}.solve.answer.${state2}.fail`)
    .some(state.matches)
}

function isFirstFlip(state) {
  return ['shortSession', 'longSession']
    .map(substate => `${substate}.solve.nav.firstFlip`)
    .some(state.matches)
}

function isLastFlip(state) {
  return ['shortSession', 'longSession']
    .map(type => `${type}.solve.nav.lastFlip`)
    .some(state.matches)
}

function hasManyFlips(state) {
  return sessionFlips(state).length > 1
}

function canSubmit(state) {
  if (isShortSession(state) || isLongSessionFlips(state))
    return (hasAllAnswers(state) || isLastFlip(state)) && !isSubmitting(state)

  if (isLongSessionKeywords(state))
    return (
      (hasAllRelevanceMarks(state) || isLastFlip(state)) && !isSubmitting(state)
    )
}

function sessionFlips(state) {
  const {
    context: {shortFlips, longFlips},
  } = state
  return isShortSession(state)
    ? rearrangeFlips(filterRegularFlips(shortFlips))
    : rearrangeFlips(longFlips.filter(readyFlip))
}

function hasAllAnswers(state) {
  const {
    context: {shortFlips, longFlips},
  } = state
  const flips = isShortSession(state)
    ? shortFlips.filter(({decoded, extra}) => decoded && !extra)
    : longFlips.filter(({decoded}) => decoded)
  return flips.length && flips.every(({option}) => option)
}

function hasAllRelevanceMarks({context: {longFlips}}) {
  const flips = filterSolvableFlips(longFlips)
  return flips.length && flips.every(({relevance}) => relevance)
}
