import React, {useEffect, useState} from 'react'
import Router from 'next/router'
import {decode} from 'rlp'
import dayjs from 'dayjs'
import {backgrounds, rem, padding, position} from 'polished'
import ValidationHeader from '../../screens/validation/components/validation-header'
import ValidationScene from '../../screens/validation/components/validation-scene'
import ValidationActions from '../../screens/validation/components/validation-actions'
import FlipThumbnails from '../../screens/validation/components/flip-thumbnails'
import {fromHexString} from '../../shared/utils/string'
import Flex from '../../shared/components/flex'
import {fetchFlipHashes} from '../../shared/api/validation'
import {
  answered,
  types as answerTypes,
} from '../../screens/validation/utils/answers'
import {useInterval} from '../../shared/hooks/use-interval'
import useValidation from '../../shared/utils/useValidation'
import {Link, IconClose} from '../../shared/components'
import Timer from '../../screens/validation/components/timer'
import {useEpochState} from '../../shared/providers/epoch-context'
import theme from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {useTimingState} from '../../shared/providers/timing-context'
import {fetchFlip} from '../../shared/api'

export default function() {
  const {submitLongAnswers} = useValidation()

  const [flips, setFlips] = useState([])
  const [flipHashes, setFlipHashes] = useState([])
  const [orders, setOrders] = useState([])
  const [currentFlipIdx, setCurrentFlipIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [flipsLoaded, setFlipsLoaded] = useState(false)
  const [loadedStates, setLoadedStates] = useState([])

  const {longSession} = useTimingState()
  const epoch = useEpochState()

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const flipHashesResult = await fetchFlipHashes('long')
      if (!flipHashesResult || !flipHashesResult.length) {
        return
      }

      const mappedFlipHashes = flipHashesResult.map(({hash}) => hash)

      const flipsResult = await Promise.all(mappedFlipHashes.map(fetchFlip))
      const flipHexes = flipsResult
        .filter(({result}) => result && result.hex)
        .map(({result}) => result.hex.substr(2))

      const decodedFlipHexes = flipHexes.map(hex => decode(fromHexString(hex)))
      const decodedFlips = decodedFlipHexes.map(f => f[0])
      const decodedOrders = decodedFlipHexes.map(f =>
        f[1].map(x => x.map(xx => xx[0] || 0))
      )

      const nextLoadedState = flipHashesResult.map(({ready}) => ready)

      if (!ignore) {
        setFlips(decodedFlips)
        setFlipHashes(mappedFlipHashes)
        setOrders(decodedOrders)
        setAnswers(decodedFlips.map(() => null))
        setLoadedStates(nextLoadedState)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  useInterval(
    () => {
      async function fetchData() {
        const flipHashesResult = await fetchFlipHashes('long')
        if (!flipHashesResult || !flipHashesResult.length) {
          return
        }

        const mappedFlipHashes = flipHashesResult.map(({hash}) => hash)

        const flipsResult = await Promise.all(mappedFlipHashes.map(fetchFlip))
        const flipHexes = flipsResult
          .filter(({result}) => result && result.hex)
          .map(({result}) => result.hex.substr(2))

        const decodedFlipHexes = flipHexes.map(hex =>
          decode(fromHexString(hex))
        )
        const decodedFlips = decodedFlipHexes.map(f => f[0])
        const decodedOrders = decodedFlipHexes.map(f =>
          f[1].map(x => x.map(xx => xx[0] || 0))
        )

        setFlips(decodedFlips)
        setFlipHashes(mappedFlipHashes)
        setOrders(decodedOrders)

        const nextLoadedState = flipHashesResult.map(({ready}) => ready)
        setFlipsLoaded(nextLoadedState.every(x => x))
        setLoadedStates(nextLoadedState)
      }

      fetchData()
    },
    flipsLoaded ? null : 1000
  )

  if (epoch === null || longSession === null) {
    return null
  }

  const handlePrev = () => {
    const prevFlipIdx = Math.max(0, currentFlipIdx - 1)
    setCurrentFlipIdx(prevFlipIdx)
  }

  const handleNext = () => {
    const nextFlipIdx = Math.min(currentFlipIdx + 1, flips.length - 1)
    setCurrentFlipIdx(nextFlipIdx)
  }

  const handlePick = idx => setCurrentFlipIdx(idx)

  const handleAnswer = option => {
    const nextAnswers = [
      ...answers.slice(0, currentFlipIdx),
      option,
      ...answers.slice(currentFlipIdx + 1),
    ]
    setAnswers(nextAnswers)
  }

  const handleReportAbuse = () => {
    const nextAnswers = [
      ...answers.slice(0, currentFlipIdx),
      answerTypes.inappropriate,
      ...answers.slice(currentFlipIdx + 1),
    ]
    setAnswers(nextAnswers)
    setCurrentFlipIdx(Math.min(currentFlipIdx + 1, flips.length - 1))
  }

  const handleSubmitAnswers = async () => {
    const answersPayload = flipHashes.map((hash, idx) => ({
      hash,
      easy: false,
      answer: answered(answers[idx]) ? answers[idx] + 1 : answerTypes.none,
    }))
    submitLongAnswers(answersPayload)
    Router.replace('/dashboard')
  }

  const finish = dayjs(
    epoch.currentValidationStart || epoch.nextValidation
  ).add(longSession, 's')

  return (
    <Layout>
      <Flex
        direction="column"
        css={{
          ...backgrounds(theme.colors.white),
          minHeight: '100vh',
          ...padding(rem(theme.spacings.medium24), rem(theme.spacings.large)),
          ...position('relative'),
        }}
      >
        <ValidationHeader
          type="long"
          currentIndex={flips.length > 0 ? currentFlipIdx + 1 : 0}
          total={flips.length}
        >
          <Link href="/dashboard">
            <IconClose />
          </Link>
        </ValidationHeader>
        <Flex direction="column" flex="1">
          <ValidationScene
            flip={flips[currentFlipIdx]}
            orders={orders[currentFlipIdx]}
            onPrev={handlePrev}
            onNext={handleNext}
            onAnswer={handleAnswer}
            selectedOption={answers[currentFlipIdx]}
            loaded={loadedStates[currentFlipIdx]}
            last={currentFlipIdx > flips.length - 1}
            type="long"
          />
          <ValidationActions
            onReportAbuse={handleReportAbuse}
            canSubmit={answers.length > 0 && answers.every(answered)}
            onSubmitAnswers={handleSubmitAnswers}
            countdown={<Timer seconds={finish.diff(dayjs(), 's')} />}
          />
        </Flex>
        <FlipThumbnails
          currentIndex={currentFlipIdx}
          flips={flips}
          answers={answers}
          onPick={handlePick}
        />
      </Flex>
    </Layout>
  )
}
