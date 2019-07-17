import React, {useEffect} from 'react'
import Router from 'next/router'
import {backgrounds, padding, rem, position} from 'polished'
import ValidationHeader from '../../screens/validation/components/validation-header'
import Timer from '../../screens/validation/components/timer'
import ValidationScene from '../../screens/validation/components/validation-scene'
import ValidationActions from '../../screens/validation/components/validation-actions'
import FlipThumbnails from '../../screens/validation/components/flip-thumbnails'
import Flex from '../../shared/components/flex'
import {useInterval} from '../../shared/hooks/use-interval'
import theme from '../../shared/theme'
import {useEpochState} from '../../shared/providers/epoch-context'
import {IconClose, Link} from '../../shared/components'
import {
  submitShortAnswers,
  useValidationDispatch,
  useValidationState,
  START_FETCH_FLIPS,
  PREV,
  NEXT,
  ANSWER,
  REPORT_ABUSE,
  PICK,
  SessionType,
  fetchFlips,
} from '../../shared/providers/validation-context'
import Spinner from '../../screens/validation/components/spinner'

function ShortSession() {
  const state = useValidationState()
  const dispatch = useValidationDispatch()
  const epoch = useEpochState()

  useEffect(() => {
    let ignore = false

    if (!state.ready && !ignore) {
      dispatch({type: START_FETCH_FLIPS})
    }

    return () => {
      ignore = true
    }
  }, [dispatch, state.ready])

  useInterval(
    async () => {
      await fetchFlips(dispatch, SessionType.Short)
    },
    state.ready ? null : 1000,
    true
  )

  const handleSubmitAnswers = async () => {
    await submitShortAnswers(dispatch, state.flips, epoch.epoch)
    Router.push('/validation/long')
  }

  return (
    <Flex
      direction="column"
      css={{
        ...backgrounds('rgba(0,0,0,1)'),
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
        currentIndex={state.currentIndex}
        total={state.flips.length}
      >
        <Link href="/dashboard">
          <IconClose />
        </Link>
      </ValidationHeader>
      <Flex
        direction="column"
        align="center"
        flex={1}
        css={position('relative')}
      >
        {state.loading && <Spinner />}
        {state.flips[state.currentIndex] && (
          <ValidationScene
            flip={state.flips[state.currentIndex]}
            onPrev={() => dispatch({type: PREV})}
            onNext={() => dispatch({type: NEXT})}
            onAnswer={option => dispatch({type: ANSWER, option})}
            isFirst={state.currentIndex === 0}
            isLast={state.currentIndex >= state.flips.length - 1}
            type={SessionType.Short}
          />
        )}
      </Flex>
      <ValidationActions
        onReportAbuse={hash => dispatch({type: REPORT_ABUSE, hash})}
        canSubmit={state.canSubmit}
        onSubmitAnswers={handleSubmitAnswers}
        countdown={<Timer type={SessionType.Short} />}
      />
      <FlipThumbnails
        currentIndex={state.currentIndex}
        flips={state.flips}
        onPick={index => dispatch({type: PICK, index})}
      />
    </Flex>
  )
}

export default ShortSession
