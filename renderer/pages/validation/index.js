/* eslint-disable react/prop-types */
import {useMachine} from '@xstate/react'
import Link from 'next/link'
import {useMemo, useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import {padding, margin} from 'polished'
import {FiCheck, FiThumbsDown} from 'react-icons/fi'
import {
  createValidationMachine,
  RelevanceType,
  persistValidationState,
  loadValidationState,
} from '../../screens/validation/machine'
import {
  Scene,
  ActionBar,
  Thumbnails,
  Header,
  Title,
  SessionTitle,
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
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {IconClose, Button, Tooltip, Box, Text} from '../../shared/components'
import {AnswerType} from '../../shared/providers/validation-context'
import {Debug} from '../../shared/components/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useTimingState} from '../../shared/providers/timing-context'
import {
  filterRegularFlips,
  filterSolvableFlips,
  rearrangeFlips,
} from '../../screens/validation/utils'
import {addWheelHandler} from '../../shared/utils/mouse'

export default function ValidationPage() {
  const epoch = useEpochState()
  const timing = useTimingState()

  // the reason why it's not wrapped with the Layout is lack of this layout for the validatio things
  // we're just painting on a blank canvas here, but 👇
  // TODO: move it to the Page component, allowing for Layout prop equals `null` in our case
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
  const validationMachine = useMemo(
    () =>
      createValidationMachine({
        epoch,
        validationStart,
        shortSessionDuration,
        longSessionDuration,
      }),
    [epoch, longSessionDuration, shortSessionDuration, validationStart]
  )
  const [state, send] = useMachine(validationMachine, {
    state: loadValidationState(),
    logger: global.isDev
      ? console.log
      : (...args) => global.logger.debug(...args),
  })

  const {currentIndex} = state.context

  const router = useRouter()

  useEffect(() => {
    persistValidationState(state)
  }, [state])

  return (
    <Scene bg={isShortSession(state) ? theme.colors.black : theme.colors.white}>
      <Header>
        {!isLongSessionKeywords(state) ? (
          <SessionTitle
            color={
              isShortSession(state) ? theme.colors.white : theme.colors.text
            }
            current={currentIndex + 1}
            total={sessionFlips(state).length}
          />
        ) : (
          <Title
            color={
              isShortSession(state) ? theme.colors.white : theme.colors.text
            }
          >
            Check flips quality
          </Title>
        )}
        {state.matches('longSession') && (
          <Link href="/dashboard">
            <a>
              <IconClose color={theme.colors.black} size={rem(20)} />
            </a>
          </Link>
        )}
      </Header>
      <CurrentStep>
        <FlipChallenge>
          <Flip
            {...currentFlip(state)}
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
            {...currentFlip(state)}
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
          {isLongSessionKeywords(state) && currentFlip(state) && (
            <FlipWords currentFlip={currentFlip(state)}>
              <QualificationActions>
                <QualificationButton
                  flip={currentFlip(state)}
                  variant={RelevanceType.Relevant}
                  onVote={hash =>
                    send({
                      type: 'TOGGLE_WORDS',
                      hash,
                      relevance: RelevanceType.Relevant,
                    })
                  }
                >
                  {currentFlip(state).relevance === RelevanceType.Relevant && (
                    <FiCheck
                      size={rem(20)}
                      fontSize={rem(13)}
                      style={{
                        ...margin(0, rem(4), 0, 0),
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                  Both relevant
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
                    flip={currentFlip(state)}
                    variant={RelevanceType.Irrelevant}
                    onVote={hash =>
                      send({
                        type: 'TOGGLE_WORDS',
                        hash,
                        relevance: RelevanceType.Irrelevant,
                      })
                    }
                  >
                    <FiThumbsDown
                      size={rem(20)}
                      fontSize={rem(13)}
                      style={{
                        ...margin(0, rem(4), 0, 0),
                        verticalAlign: 'middle',
                      }}
                    />
                    Report
                  </QualificationButton>
                </Tooltip>
              </QualificationActions>
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
                  : 'Go to last flip'
              }
            >
              <Button
                disabled={!canSubmit(state)}
                onClick={() => send('SUBMIT')}
              >
                {isSubmitting(state)
                  ? 'Submitting answers...'
                  : 'Submit answers'}
              </Button>
            </Tooltip>
          )}
          {isLongSessionFlips(state) && (
            <Button
              disabled={!canSubmit(state)}
              onClick={() => send('FINISH_FLIPS')}
            >
              Start checking keywords
            </Button>
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
          onSubmit={() => router.push('/dashboard')}
        />
      )}

      {state.matches('validationFailed') && (
        <ValidationFailedDialog
          isOpen
          onSubmit={() => router.push('/dashboard')}
        />
      )}

      {global.isDev && <Debug>{JSON.stringify(state.value, null, 2)}</Debug>}
    </Scene>
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
    : filterSolvableFlips(longFlips)
}

function currentFlip(state) {
  const {
    context: {currentIndex},
  } = state
  return sessionFlips(state)[currentIndex]
}

function hasAllAnswers(state) {
  const {
    context: {shortFlips, longFlips},
  } = state
  const flips = isShortSession(state)
    ? shortFlips.filter(({decoded, extra}) => decoded && !extra)
    : filterSolvableFlips(longFlips)
  return flips.length && flips.every(({option}) => option)
}

function hasAllRelevanceMarks({context: {longFlips}}) {
  const flips = filterSolvableFlips(longFlips)
  return flips.length && flips.every(({relevance}) => relevance)
}
