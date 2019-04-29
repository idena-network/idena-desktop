import React, {useEffect, useState} from 'react'
import {decode} from 'rlp'
import Layout from '../../shared/validation-layout'
import ValidationHeader from '../../shared/validation-header'
import Timer from './components/timer'
import ValidationScene from '../../shared/validation-scene'
import ValidationActions from '../../shared/validation-actions'
import FlipThumbnails from '../../shared/flip-thumbnails'
import {flipsStorageKey} from '../../../flips/providers/flip-provider'
import {fetchFlip} from '../../../../shared/services/api'
import {fromHexString} from '../../../../shared/utils/string'
import Flex from '../../../../shared/components/flex'

export default function() {
  const [flips, setFlips] = useState([])
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

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const hashes = JSON.parse(localStorage.getItem(flipsStorageKey)) || []
      const responses = await Promise.all(hashes.map(hash => fetchFlip(hash)))

      const flipsResult = responses.map(({result}) =>
        result ? decode(fromHexString(result.hex.substr(2))) : []
      )
      // [[ab1,ab2,ab3,ab4], [[1,2,3,4], [4,3,2,1]]]

      if (!ignore) {
        setFlips(flipsResult.map(f => f[0]))
        setOrders(flipsResult.map(f => f[1].map(x => x.map(xx => xx[0] || 0))))
        setAnswers(flipsResult.map(f => f[0]).map(() => null))
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
          />
        </Flex>
        <Flex align="center" justify="center">
          <FlipThumbnails currentIndex={currentFlipIdx} flips={flips} />
        </Flex>
      </Flex>
    </Layout>
  )
}
