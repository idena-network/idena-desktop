import {useMachine} from '@xstate/react'
import {padding, position} from 'polished'
import {validationMachine} from '../../screens/validation/validation-machine'
import Spinner from '../../screens/validation/components/spinner'
import {
  ValidationScene,
  ValidationActions,
  FlipThumbnails,
} from '../../screens/validation/components'
import theme, {rem} from '../../shared/theme'
import {Box} from '../../shared/components'
import Flex from '../../shared/components/flex'
import {SessionType} from '../../shared/providers/validation-context'
import Timer from '../../screens/validation/components/timer'
import ValidationHeader from '../../screens/validation/components/validation-header'

export default function ValidationPage() {
  const [current, send] = useMachine(validationMachine)

  // if (
  //   current.matches('fetchShortHashes') ||
  //   current.matches('fetchShortFlips') ||
  //   current.matches('decodeShortFlips')
  // )
  //   return <Loading />

  if (current.matches('solvingShortSession')) {
    const {shortFlips, currentIndex} = current.context
    const isPreparing = current.matches('fetch') || current.matches('decode')
    const isLastFlip = current.matches('solvingShortSession.lastFlip')
    const isFirstFlip = currentIndex === 0
    return (
      <Box
        style={{
          background: theme.colors.black0,
          height: '100vh',
          ...padding(
            rem(theme.spacings.medium24),
            rem(theme.spacings.large),
            rem(theme.spacings.medium16)
          ),
        }}
      >
        <ValidationHeader
          type={SessionType.Short}
          currentIndex={currentIndex}
          total={shortFlips.length}
        />
        <Flex
          direction="column"
          align="center"
          flex={1}
          css={{...position('relative')}}
        >
          {isPreparing && <Spinner />}
          <ValidationScene
            flip={shortFlips[currentIndex]}
            onPrev={() => send('PREV')}
            onNext={() => send('NEXT')}
            onAnswer={option => send({type: 'ANSWER', option})}
            isFirst={isFirstFlip}
            isLast={isLastFlip}
            type={SessionType.Short}
          />
        </Flex>
        <ValidationActions
          canSubmit={!isFirstFlip} // FIXME: define based on state
          onSubmitAnswers={() => send('SUBMIT')}
          countdown={<Timer type={SessionType.Short} />}
        />
        <FlipThumbnails
          currentIndex={currentIndex}
          flips={shortFlips}
          onPick={index => send({type: 'PICK', index})}
        />
        {/* <InviteQualificationModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={() => Router.push('/validation/long')}
        /> */}
      </Box>
      // <div>
      //   {shortFlips.map((flip, index) => (
      //     <div key={flip.hash} hidden={currentIndex !== index}>
      //       <h1>
      //         {flip.hash} - {currentIndex}
      //       </h1>
      //       <button type="button" onClick={() => send('PREV')}>
      //         Prev {currentIndex - 1}
      //       </button>
      //       {flip.images.map(img => (
      //         <img
      //           src={img}
      //           alt={img}
      //           key={img}
      //           style={{
      //             height: rem(160),
      //             width: rem(160),
      //           }}
      //         />
      //       ))}
      //       <button type="button" onClick={() => send('NEXT')}>
      //         Next {currentIndex + 1}
      //       </button>
      //       {current.matches('solvingShortSession.lastFlip') && (
      //         <h2>Last flip</h2>
      //       )}
      //     </div>
      //   ))}
      // </div>
    )
  }

  return <pre>{JSON.stringify(current.value)}</pre>
}
