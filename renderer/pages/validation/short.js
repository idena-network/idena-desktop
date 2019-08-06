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
  SHOW_EXTRA_FLIPS,
} from '../../shared/providers/validation-context'
import Spinner from '../../screens/validation/components/spinner'
import {useTimeout} from '../../shared/hooks/use-timeout'

const EXTRA_FLIPS_DELAY = 30 * 1000 // 30 sec

function ShortSession() {
  const state = useValidationState()
  const dispatch = useValidationDispatch()
  const epoch = useEpochState()

  useEffect(() => {
    if (state.shortAnswersSubmitted) {
      Router.push('/validation/long')
    }
  }, [state.shortAnswersSubmitted])

  useEffect(() => {
    if (!state.ready && !state.shortAnswersSubmitted) {
      dispatch({type: START_FETCH_FLIPS})
    }
  }, [dispatch, state.ready, state.shortAnswersSubmitted])

  useInterval(
    async () => {
      await fetchFlips(dispatch, SessionType.Short, state.flips)
    },
    state.ready || state.shortAnswersSubmitted ? null : 1000 * 1,
    true
  )

  useTimeout(() => {
    if (!state.ready && !state.shortAnswersSubmitted) {
      dispatch({type: SHOW_EXTRA_FLIPS})
    }
  }, EXTRA_FLIPS_DELAY)

  const handleSubmitAnswers = async () => {
    await submitShortAnswers(dispatch, state.flips, epoch.epoch)
  }

  const availableFlipsLength = state.flips.filter(x => !x.hidden).length

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
        overflow: 'hidden',
      }}
    >
      <ValidationHeader
        type={SessionType.Short}
        currentIndex={state.currentIndex}
        total={availableFlipsLength}
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
        {(state.loading || state.shortAnswersSubmitted) && <Spinner />}
        {!state.shortAnswersSubmitted && state.flips[state.currentIndex] && (
          <ValidationScene
            flip={state.flips[state.currentIndex]}
            onPrev={() => dispatch({type: PREV})}
            onNext={() => dispatch({type: NEXT})}
            onAnswer={option => dispatch({type: ANSWER, option})}
            isFirst={state.currentIndex === 0}
            isLast={state.currentIndex >= availableFlipsLength - 1}
            type={SessionType.Short}
          />
        )}
      </Flex>
      <ValidationActions
        onReportAbuse={() => dispatch({type: REPORT_ABUSE})}
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
