import React, {useEffect} from 'react'
import Router from 'next/router'
import {backgrounds, rem, padding, position} from 'polished'
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
import Layout from '../../shared/components/layout'
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
} from '../../shared/providers/validation-context'
import Spinner from '../../screens/validation/components/spinner'
import Modal from '../../shared/components/modal'

// eslint-disable-next-line react/display-name
export default function() {
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

  const [showModal, setShowModal] = React.useState()

  useEffect(() => {
    if (!state.shortAnswersSubmitted) {
      setShowModal(true)
      setTimeout(() => Router.push('/dashboard'), 3000)
    }
  }, [state.shortAnswersSubmitted])

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

  const handleSubmitAnswers = async () => {
    await submitLongAnswers(dispatch, state.flips, epoch.epoch)
  }

  const availableFlipsLength = state.flips.filter(x => !x.hidden).length

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
          onSubmitAnswers={handleSubmitAnswers}
          countdown={<Timer type={SessionType.Long} />}
        />
        <FlipThumbnails
          currentIndex={state.currentIndex}
          flips={state.flips}
          onPick={index => dispatch({type: PICK, index})}
        />
      </Flex>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false)
        }}
      >
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
    </Layout>
  )
}
