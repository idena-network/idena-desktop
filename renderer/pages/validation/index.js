/* eslint-disable react/prop-types */
import {useMachine} from '@xstate/react'
import Link from 'next/link'
import {useMemo, useEffect} from 'react'
import {useRouter} from 'next/router'
import {
  createValidationMachine,
  RelevanceType,
  persistValidationState,
  loadValidationState,
} from '../../screens/validation/validation-machine'
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
  Arrow,
  WelcomeKeywordsQualificationDialog,
  ValidationTimer,
  ValidationFailedDialog,
  ValidationSucceededDialog,
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {IconClose, Button} from '../../shared/components'
import {
  SessionType,
  AnswerType,
} from '../../shared/providers/validation-context'
import {Debug} from '../../shared/components/utils'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useTimingState} from '../../shared/providers/timing-context'

export default function ValidationPage() {
  const epoch = useEpochState()
  const timing = useTimingState()

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
    logger: (...args) => global.logger.debug(...args),
  })

  const {currentIndex} = state.context

  const router = useRouter()

  useEffect(() => {
    persistValidationState(state)
  }, [state])

  if (state.matches('validationSucceeded'))
    return (
      <Scene bg={theme.colors.white}>
        <ValidationSucceededDialog
          isOpen
          onSubmit={() => router.push('/dashboard')}
        />
      </Scene>
    )

  if (state.matches('shortSession.solve.answer.submitShortSession.done'))
    return (
      <Scene bg={theme.colors.black}>
        <WelcomeQualificationDialog
          isOpen
          onSubmit={() => send('START_LONG_SESSION')}
        />
      </Scene>
    )

  if (state.matches('longSession.solve.answer.finishFlips'))
    return (
      <Scene bg={theme.colors.white}>
        <WelcomeKeywordsQualificationDialog
          isOpen
          onSubmit={() => send('START_KEYWORDS_QUALIFICATION')}
        />
      </Scene>
    )
  if (state.matches('validationFailed'))
    return (
      <Scene bg={theme.colors.black}>
        <ValidationFailedDialog
          isOpen
          onSubmit={() => router.push('/dashboard')}
        />
      </Scene>
    )

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
            onChoose={() => send({type: 'ANSWER', option: AnswerType.Left})}
          />
          <Flip
            {...currentFlip(state)}
            variant={AnswerType.Right}
            onChoose={() => send({type: 'ANSWER', option: AnswerType.Right})}
          />
          {isLongSessionKeywords(state) && (
            <FlipWords currentFlip={currentFlip(state)}>
              <QualificationActions>
                {Object.values(RelevanceType).map(relevance => (
                  <QualificationButton
                    key={relevance}
                    flip={currentFlip(state)}
                    variant={relevance}
                    onClick={() =>
                      send({
                        type: 'TOGGLE_WORDS',
                        relevance,
                      })
                    }
                  >
                    {relevance === RelevanceType.Relevant && 'Both relevant'}
                    {relevance === RelevanceType.Irrelevant && 'Irrelevant'}
                  </QualificationButton>
                ))}
              </QualificationActions>
            </FlipWords>
          )}
        </FlipChallenge>
      </CurrentStep>
      <ActionBar>
        <ActionBarItem />
        <ActionBarItem justify="center">
          {isShortSession(state) && (
            <ValidationTimer
              validationStart={validationStart}
              duration={shortSessionDuration - 10}
            />
          )}
          {isLongSession(state) && (
            <ValidationTimer
              validationStart={validationStart}
              duration={shortSessionDuration - 10 + longSessionDuration}
            />
          )}
        </ActionBarItem>
        <ActionBarItem justify="flex-end">
          {(isShortSession(state) || isLongSessionKeywords(state)) && (
            <Button disabled={!canSubmit(state)} onClick={() => send('SUBMIT')}>
              {isSubmitting(state) ? 'Submitting answers...' : 'Submit answers'}
            </Button>
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
      {!isFirstFlip(state) && (
        <NavButton left={0}>
          <Arrow
            dir="prev"
            type={isShortSession(state) ? SessionType.Short : SessionType.Long}
            onClick={() => send({type: 'PREV'})}
          />
        </NavButton>
      )}
      {!isLastFlip(state) && (
        <NavButton right={0}>
          <Arrow
            dir="next"
            type={isShortSession(state) ? SessionType.Short : SessionType.Long}
            onClick={() => send({type: 'NEXT'})}
          />
        </NavButton>
      )}
      <Debug>{JSON.stringify(state.value, null, 2)}</Debug>
    </Scene>
  )
}

function isShortSession(state) {
  return state.matches('shortSession')
}

function isLongSession(state) {
  return state.matches('longSession')
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

function isSubmitting(state) {
  return [
    'shortSession.solve.answer.submitShortSession',
    'longSession.solve.answer.finishFlips',
    'longSession.solve.answer.submitLongSession',
  ].some(state.matches)
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

function canSubmit(state) {
  if (isShortSession(state) || isLongSessionFlips(state))
    return (
      (hasAllAnswers(sessionFlips(state)) || isLastFlip(state)) &&
      !isSubmitting(state)
    )

  if (isLongSessionKeywords(state))
    return (
      (hasAllRelevanceMarks(sessionFlips(state)) || isLastFlip(state)) &&
      !isSubmitting(state)
    )
}

function sessionFlips(state) {
  const {
    context: {shortFlips, longFlips},
  } = state
  const flips = isShortSession(state)
    ? shortFlips
    : longFlips.filter(({loaded, decoded}) => loaded && decoded)
  return flips.filter(({extra}) => !extra)
}

function currentFlip(state) {
  const {
    context: {currentIndex},
  } = state
  return sessionFlips(state)[currentIndex]
}

function hasAllAnswers(flips) {
  return flips.length && flips.every(({option}) => option)
}

function hasAllRelevanceMarks(flips) {
  return flips.length && flips.every(({relevance}) => relevance)
}
