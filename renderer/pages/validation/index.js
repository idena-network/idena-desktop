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
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {IconClose, Button} from '../../shared/components'
import {
  SessionType,
  AnswerType,
} from '../../shared/providers/validation-context'
import Timer from '../../screens/validation/components/timer'

export default function ValidationPage() {
  const [state, send] = useMachine(validationMachine)

  const {shortFlips, longFlips, currentIndex} = state.context
  const isLastFlip = state.matches({solveShortSession: 'lastFlip'})

  return (
    <Scene>
      <Header>
        {state.matches('shortSession') && (
          <SessionTitle
            current={currentIndex + 1}
            total={filterFlips(shortFlips).length}
          />
        )}
        {state.matches('longSession.solveLongSession') && (
          <SessionTitle
            current={currentIndex + 1}
            total={filterFlips(longFlips).length}
          />
        )}
        {state.matches('longSession.qualification') && (
          <Title>Check flips quality</Title>
        )}
        {state.matches('longSession') && (
          <Link href="/dashboard">
            <IconClose color={theme.colors.white} size={rem(20)} />
          </Link>
        )}
      </Header>
      <CurrentStep>
        {state.matches('shortSession.solveShortSession.normal') && (
          <FlipChallenge>
            <Flip
              {...currentFlip(shortFlips, currentIndex)}
              variant={AnswerType.Left}
              onChoose={() => send({type: 'ANSWER', option: AnswerType.Left})}
            />
            <Flip
              {...currentFlip(shortFlips, currentIndex)}
              variant={AnswerType.Right}
              onChoose={() => send({type: 'ANSWER', option: AnswerType.Right})}
            />
          </FlipChallenge>
        )}
      </CurrentStep>
      <ActionBar>
        <ActionBarItem />
        <ActionBarItem justify="center">
          <Timer type={SessionType.Short} />
        </ActionBarItem>
        <ActionBarItem justify="flex-end">
          <Button
            disabled={!(isLastFlip || hasAnswers(shortFlips))} // FIXME: define based on validation state too
            onClick={() => send('SUBMIT')}
          >
            Submit answers
          </Button>
        </ActionBarItem>
      </ActionBar>
      <Thumbnails currentIndex={currentIndex}>
        {state.matches('shortSession.solveShortSession.normal') &&
          filterFlips(shortFlips).map((flip, idx) => (
            <Thumbnail
              key={flip.hash}
              {...flip}
              isCurrent={currentIndex === idx}
              onPick={() => send({type: 'PICK', index: idx})}
            />
          ))}
      </Thumbnails>
      {/* <InviteQualificationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={() => Router.push('/validation/long')}
        /> */}
    </Scene>
  )
}

function filterFlips(flips) {
  return flips.filter(({extra}) => !extra)
}

function currentFlip(flips, idx) {
  return filterFlips(flips)[idx]
}

function hasAnswers(flips) {
  return flips.some(({option}) => option)
}
