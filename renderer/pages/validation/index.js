import {useMachine} from '@xstate/react'
import Link from 'next/link'
import {validationMachine} from '../../screens/validation/validation-machine'
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
  PrevButton,
  NextButton,
  NavButton,
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {IconClose, Button, Absolute} from '../../shared/components'
import {
  SessionType,
  AnswerType,
} from '../../shared/providers/validation-context'
import Timer from '../../screens/validation/components/timer'
import Arrow from '../../screens/validation/components/arrow'

export default function ValidationPage() {
  const [state, send] = useMachine(validationMachine)

  const {shortFlips, currentIndex} = state.context

  if (state.matches('validationSucceeded'))
    return (
      <Scene
        bg={isShortSession(state) ? theme.colors.black : theme.colors.white}
      >
        Done
      </Scene>
    )

  return (
    <Scene bg={isShortSession(state) ? theme.colors.black : theme.colors.white}>
      <Header>
        {!isQualification(state) ? (
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
            <IconClose color={theme.colors.white} size={rem(20)} />
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
          {isQualification(state) && (
            <FlipWords words={[]} currentFlip={currentFlip(state)} />
          )}
        </FlipChallenge>
      </CurrentStep>
      <ActionBar>
        <ActionBarItem />
        <ActionBarItem justify="center">
          <Timer
            type={isShortSession(state) ? SessionType.Short : SessionType.Long}
          />
        </ActionBarItem>
        <ActionBarItem justify="flex-end">
          {isShortSession(state) ? (
            <Button
              disabled={!hasAnswers(shortFlips) || isSubmittingAnwsers(state)} // FIXME: define based on validation state too
              onClick={() => send('SUBMIT')}
            >
              {isSubmittingAnwsers(state)
                ? 'Submitting answers...'
                : 'Submit answers'}
            </Button>
          ) : (
            <Button
              disabled={!hasAnswers(shortFlips) || isSubmittingAnwsers(state)} // FIXME: define based on validation state too
              onClick={() =>
                send(isQualification(state) ? 'SUBMIT' : 'QUALIFY_WORDS')
              }
            >
              {/* eslint-disable-next-line no-nested-ternary */}
              {isSubmittingAnwsers(state)
                ? 'Submitting answers...'
                : isQualification(state)
                ? 'Submit answers'
                : 'Next'}
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
      <NavButton left={0}>
        <Arrow
          dir="prev"
          type={isShortSession(state) ? SessionType.Short : SessionType.Long}
          onClick={() => send({type: 'PREV'})}
        />
      </NavButton>
      <NavButton right={0}>
        <Arrow
          dir="next"
          type={isShortSession(state) ? SessionType.Short : SessionType.Long}
          onClick={() => send({type: 'NEXT'})}
        />
      </NavButton>
      {/* <InviteQualificationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={() => Router.push('/validation/long')}
        /> */}
      <Absolute bottom={10} left={10}>
        <pre>{JSON.stringify(state.value, null, 2)}</pre>
        <style jsx>{`
          pre {
            background: whitesmoke;
            border-radius: 0.5rem;
            padding: 1rem;
            opacity: 0.7;
          }
        `}</style>
      </Absolute>
    </Scene>
  )
}

function isShortSession(state) {
  return state.matches('shortSession')
}

function isSubmittingAnwsers(state) {
  return (
    state.matches('shortSession.solveShortSession.submittingShortSession') ||
    state.matches('longSession.solveLongSession.submittingLongSession')
  )
}

function isQualification(state) {
  return state.matches('longSession.qualification')
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

function hasAnswers(flips) {
  return flips.some(({option}) => option)
}
