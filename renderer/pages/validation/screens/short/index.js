import React, {useEffect, useState} from 'react'
import {decode} from 'rlp'
import Layout from '../../shared/components/validation-layout'
import ValidationHeader from '../../shared/components/validation-header'
import Timer from './components/timer'
import ValidationScene from '../../shared/components/validation-scene'
import ValidationActions from '../../shared/components/validation-actions'
import FlipThumbnails from '../../shared/components/flip-thumbnails'
import {fetchFlip} from '../../../../shared/services/api'
import {fromHexString} from '../../../../shared/utils/string'
import Flex from '../../../../shared/components/flex'
import {
  fetchFlipHashes,
  submitShortAnswers,
} from '../../shared/api/__mocks__/validation-api'

export default function() {
  const [flips, setFlips] = useState([])
  const [flipHashes, setFlipHashes] = useState([])
  const [orders, setOrders] = useState([])
  const [currentFlipIdx, setCurrentFlipIdx] = useState(0)
  const [answers, setAnswers] = useState([])

  const handlePrev = () => {
    const prevFlipIdx = Math.max(0, currentFlipIdx - 1)
    setCurrentFlipIdx(prevFlipIdx)
  }

  const handleNext = () => {
    const nextFlipIdx = Math.min(currentFlipIdx + 1, flips.length - 1)
    setCurrentFlipIdx(nextFlipIdx)
  }

  const handleAnswer = option => {
    const nextAnswers = [
      ...answers.slice(0, currentFlipIdx),
      option,
      ...answers.slice(currentFlipIdx + 1),
    ]
    setAnswers(nextAnswers)
  }

  const handleSubmitAnswers = async () => {
    // [{hash: "0x123", easy: false, answer: 1}]
    const anwsersInput = flipHashes.map((hash, idx) => ({
      hash,
      easy: false,
      answer: answers[idx] != null ? answers[idx] + 1 : 0,
    }))
    const result = await submitShortAnswers(anwsersInput, 0, 0)
    console.log(result)
  }

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const flipHashesResult = await fetchFlipHashes()
      const flipHashes = flipHashesResult.map(({hash}) => hash)

      const flipsResult = await Promise.all(flipHashes.map(fetchFlip))
      const flipHexes = flipsResult
        .filter(x => x)
        .map(({result}) => result.hex.substr(2))

      const decodedFlipHexes = flipHexes.map(hex => decode(fromHexString(hex)))
      const decodedFlips = decodedFlipHexes.map(f => f[0])
      const decodedOrders = decodedFlipHexes.map(f =>
        f[1].map(x => x.map(xx => xx[0] || 0))
      )

      if (!ignore) {
        setFlips(decodedFlips)
        setFlipHashes(flipHashes)
        setOrders(decodedOrders)
        setAnswers(decodedFlips.map(() => null))
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <Layout>
      <Flex direction="column" css={{minHeight: '100vh'}}>
        <ValidationHeader
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
          />
          <ValidationActions
            canSubmit={
              answers.length > 0 && answers.every(a => Number.isFinite(a))
            }
            onSubmitAnswers={handleSubmitAnswers}
          />
        </Flex>
        <Flex align="center" justify="center">
          <FlipThumbnails currentIndex={currentFlipIdx} flips={flips} />
        </Flex>
      </Flex>
    </Layout>
  )
}
