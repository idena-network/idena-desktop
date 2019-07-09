import React from 'react'
import Router from 'next/router'
import {backgrounds, rem, padding, position} from 'polished'
import ValidationHeader from '../../screens/validation/components/validation-header'
import ValidationScene from '../../screens/validation/components/validation-scene'
import ValidationActions from '../../screens/validation/components/validation-actions'
import FlipThumbnails from '../../screens/validation/components/flip-thumbnails'
import Flex from '../../shared/components/flex'
import {fetchFlipHashes} from '../../shared/api/validation'
import {useInterval} from '../../shared/hooks/use-interval'
import {Link, IconClose} from '../../shared/components'
import Timer from '../../screens/validation/components/timer'
import {useEpochState} from '../../shared/providers/epoch-context'
import theme from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {fetchFlip} from '../../shared/api'
import {
  useValidationDispatch,
  submitLongAnswers,
} from '../../shared/providers/validation-context'
import {
  sessionReducer,
  initialState,
  START_FETCH,
  FETCH_SUCCEEDED,
  FETCH_FAILED,
  FETCH_MISSING_SUCCEEDED,
  PREV,
  NEXT,
  ANSWER,
  REPORT_ABUSE,
  PICK,
} from '../../screens/validation/utils/reducer'
import Spinner from '../../screens/validation/components/spinner'

export default function() {
  const [state, dispatch] = React.useReducer(sessionReducer, initialState)
  const validationDispatch = useValidationDispatch()
  const epoch = useEpochState()

  React.useEffect(() => {
    let ignore = false

    if (!ignore) {
      dispatch({type: START_FETCH})
    }

    async function fetchData() {
      try {
        const hashes = await fetchFlipHashes('long')
        const hexes = await Promise.all(
          hashes
            .filter(x => x.ready)
            .map(x => x.hash)
            .map(hash => fetchFlip(hash).then(resp => ({hash, ...resp.result})))
        )
        if (!ignore) {
          dispatch({type: FETCH_SUCCEEDED, hashes, hexes})
        }
      } catch (error) {
        if (!ignore) {
          dispatch({type: FETCH_FAILED, error})
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  useInterval(
    async () => {
      try {
        const hexes = await Promise.all(
          state.hashes
            .filter(x => !x.ready)
            .map(x => x.hash)
            .map(hash => fetchFlip(hash).then(resp => ({hash, ...resp.result})))
        )
        dispatch({type: FETCH_MISSING_SUCCEEDED, hexes})
      } catch (error) {
        dispatch({type: FETCH_FAILED, error})
      }
    },
    state.hashes.filter(x => !x.ready).length > 0 ? 1000 : null
  )

  return (
    <Layout>
      <Flex
        direction="column"
        css={{
          ...backgrounds(theme.colors.white),
          height: '100vh',
          ...padding(
            rem(theme.spacings.medium24),
            rem(theme.spacings.large),
            rem(theme.spacings.medium16)
          ),
          ...position('relative'),
        }}
      >
        <ValidationHeader
          type="long"
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
              type="long"
            />
          )}
        </Flex>
        <ValidationActions
          onReportAbuse={hash => dispatch({type: REPORT_ABUSE, hash})}
          canSubmit={state.canSubmit}
          onSubmitAnswers={async () => {
            await submitLongAnswers(
              validationDispatch,
              state.flips,
              epoch.epoch
            )
            Router.push('/dashboard')
          }}
          countdown={<Timer type="long" />}
        />
        <FlipThumbnails
          currentIndex={state.currentIndex}
          flips={state.flips}
          onPick={index => dispatch({type: PICK, index})}
        />
      </Flex>
    </Layout>
  )
}
