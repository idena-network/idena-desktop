import React, {useEffect} from 'react'
import Router from 'next/router'
import {backgrounds, rem, padding, position, margin} from 'polished'

import ValidationHeader from '../../screens/validation/components/validation-header'
import ValidationScene from '../../screens/validation/components/validation-scene'
import ValidationActions from '../../screens/validation/components/validation-actions'
import FlipThumbnails from '../../screens/validation/components/flip-thumbnails'
import Flex from '../../shared/components/flex'
import {
  Link,
  IconClose,
  Box,
  SubHeading,
  Text,
  Button,
} from '../../shared/components'
import Timer from '../../screens/validation/components/timer'
import {useEpochState, EpochPeriod} from '../../shared/providers/epoch-context'
import theme from '../../shared/theme'
import {
  useValidationDispatch,
  submitLongAnswers,
  START_FETCH_FLIPS,
  PREV,
  NEXT,
  ANSWER,
  PICK,
  useValidationState,
  SessionType,
  fetchFlips,
  WORDS_FETCHED,
  QUALIFICATION_STARTED,
} from '../../shared/providers/validation-context'
import Spinner from '../../screens/validation/components/spinner'
import Modal from '../../shared/components/modal'
import useRpc from '../../shared/hooks/use-rpc'
import {useInterval} from '../../shared/hooks/use-interval'
import vocabulary from '../../screens/flips/utils/words'
import {useNotificationDispatch} from '../../shared/providers/notification-context'

export default function LongValidation() {
  const state = useValidationState()
  const dispatch = useValidationDispatch()
  const epoch = useEpochState()

  useEffect(() => {
    if (
      epoch &&
      ![EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
        epoch.currentPeriod
      )
    ) {
      Router.push('/dashboard')
    }
  }, [epoch])

  const [showModal, setShowModal] = React.useState(false)

  useEffect(() => {
    if (!state.shortAnswers.length) {
      setShowModal(true)
      setTimeout(() => Router.push('/dashboard'), 5000)
    }
  }, [state.shortAnswers.length])

  useEffect(() => {
    async function fetchData() {
      await fetchFlips(dispatch, SessionType.Long)
    }
    fetchData()
  }, [dispatch])

  useEffect(() => {
    if (state.longAnswersSubmitted) {
      Router.push('/dashboard')
    }
  }, [state.longAnswersSubmitted])

  useEffect(() => {
    if (!state.ready && !state.longAnswersSubmitted) {
      dispatch({type: START_FETCH_FLIPS})
    }
  }, [dispatch, state.longAnswersSubmitted, state.ready])

  const words = useWords()
  useEffect(() => {
    if (words) {
      dispatch({
        type: WORDS_FETCHED,
        words,
      })
    }
  }, [dispatch, words])

  const [showQualificationDialog, setShowQualificationDialog] = React.useState()
  useEffect(() => setShowQualificationDialog(state.qualificationRequested), [
    state.qualificationRequested,
  ])

  const {addError} = useNotificationDispatch()

  const availableFlipsLength = state.flips.filter(x => !x.hidden).length

  return (
    <>
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
          overflow: 'hidden',
        }}
      >
        <ValidationHeader
          type={SessionType.Long}
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
          {(state.longAnswersSubmitted || state.loading) && <Spinner />}
          {!state.longAnswersSubmitted && state.flips[state.currentIndex] && (
            <ValidationScene
              flip={state.flips[state.currentIndex]}
              onPrev={() => dispatch({type: PREV})}
              onNext={() => dispatch({type: NEXT})}
              onAnswer={option => dispatch({type: ANSWER, option})}
              isFirst={state.currentIndex === 0}
              isLast={state.currentIndex >= availableFlipsLength - 1}
              type={SessionType.Long}
            />
          )}
        </Flex>
        <ValidationActions
          canSubmit={state.canSubmit}
          onSubmitAnswers={async () => {
            try {
              await submitLongAnswers(dispatch, state.flips, epoch.epoch)
            } catch ({message}) {
              addError(message)
            }
          }}
          countdown={<Timer type={SessionType.Long} />}
        />
        <FlipThumbnails
          currentIndex={state.currentIndex}
          flips={state.flips}
          onPick={index => dispatch({type: PICK, index})}
        />
      </Flex>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Box m="0 0 18px">
          <SubHeading>Short session is over</SubHeading>
          <Text>
            Unfortunately, you are late: the short validation session is already
            over. You will be redirected to My Idena page.
          </Text>
        </Box>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button
              onClick={() => {
                Router.push('/dashboard')
              }}
            >
              Go to dashboard
            </Button>
          </Box>
        </Flex>
      </Modal>
      <Modal
        show={showQualificationDialog}
        onHide={() => setShowQualificationDialog(false)}
      >
        <Box m="0 0 18px">
          <SubHeading css={margin(0, 0, rem(10))}>
            Your answers are not yet submitted
          </SubHeading>
          <Text css={margin(0, 0, rem(16))}>
            Please qualify the keywords relevance and submit the answers.
          </Text>
          <Text>The flips with irrelevant keywords will be penalized.</Text>
        </Box>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button
              onClick={() =>
                dispatch({
                  type: QUALIFICATION_STARTED,
                })
              }
            >
              Ok, I understand
            </Button>
          </Box>
        </Flex>
      </Modal>
    </>
  )
}

export function useWords() {
  const {flips} = useValidationState()

  const [{result, error}, fetchWords] = useRpc()

  const unfetchedWords = flips
    .filter(x => !x.hidden)
    // eslint-disable-next-line no-shadow
    .filter(({words}) => !words)

  const lastUsedFlip = React.useRef()
  const lastUsedFlipIdx = React.useRef(0)
  const takes = React.useRef(0)

  useInterval(
    () => {
      if (takes.current < 3) {
        fetchWords('flip_words', unfetchedWords[lastUsedFlipIdx.current].hash)
        lastUsedFlip.current = unfetchedWords[lastUsedFlipIdx.current]
        takes.current += 1
      } else {
        takes.current = 0
        lastUsedFlipIdx.current =
          (lastUsedFlipIdx.current + 1) % unfetchedWords.length
      }
    },
    unfetchedWords.length ? 1000 : null
  )

  const [words, setWords] = React.useState()

  useEffect(() => {
    if (result && !error) {
      setWords([
        lastUsedFlip.current.hash,
        result.words.map(i => vocabulary[i]),
      ])
      takes.current = 0
      lastUsedFlipIdx.current = 0
    }
  }, [error, result])

  return words
}
