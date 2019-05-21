import React, {useEffect, useState, useContext} from 'react'
import Router from 'next/router'
import {decode} from 'rlp'
import Layout from '../../screens/validation/shared/components/validation-layout'
import ValidationHeader from '../../screens/validation/shared/components/validation-header'
import Timer from '../../screens/validation/screens/short/components/timer'
import ValidationScene from '../../screens/validation/shared/components/validation-scene'
import ValidationActions from '../../screens/validation/shared/components/validation-actions'
import FlipThumbnails from '../../screens/validation/shared/components/flip-thumbnails'
import {fetchFlip} from '../../shared/services/api'
import {fromHexString} from '../../shared/utils/string'
import Flex from '../../shared/components/flex'
import {
  fetchFlipHashes,
  submitLongAnswers,
} from '../../screens/validation/shared/api/validation-api'
import {
  answered,
  types as answerTypes,
} from '../../screens/validation/shared/utils/answers'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {ValidationContext} from '../../shared/providers/validation-provider'

export default function() {
  const [flips, setFlips] = useState([])
  const [flipHashes, setFlipHashes] = useState([])
  const [orders, setOrders] = useState([])
  const [currentFlipIdx, setCurrentFlipIdx] = useState(0)
  const [answers, setAnswers] = useState([])
  const [flipsLoaded, setFlipsLoaded] = useState(false)
  const [loadedStates, setLoadedStates] = useState([])

  const {onSubmitLongAnswers} = useContext(ValidationContext)

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
    await submitLongAnswers(answersPayload, 0, 0)
    onSubmitLongAnswers()
    Router.replace('/dashboard')
  }

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

  return (
    <Layout>
      <Flex direction="column" css={{minHeight: '100vh'}}>
        <ValidationHeader
          type="Long"
          currentIndex={currentFlipIdx + 1}
          total={flips.length}
        >
          <Timer />
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
          />
          <ValidationActions
            onReportAbuse={handleReportAbuse}
            canSubmit={answers.length > 0 && answers.every(answered)}
            onSubmitAnswers={handleSubmitAnswers}
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
