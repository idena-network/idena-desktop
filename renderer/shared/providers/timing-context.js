import React from 'react'
import {useRpc} from '../api/api-client'

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const {data} = useRpc('dna_ceremonyIntervals')
  return (
    <TimingStateContext.Provider value={mapToFriendlyTiming(data)} {...props} />
  )
}

export function useTimingState() {
  const context = React.useContext(TimingStateContext)
  if (context === undefined) {
    throw new Error('useTimingState must be used within a TimingProvider')
  }
  return context
}

function mapToFriendlyTiming(data) {
  if (data) {
    const {
      ValidationInterval: validation,
      FlipLotteryDuration: flipLottery,
      ShortSessionDuration: shortSession,
      LongSessionDuration: longSession,
      AfterLongSessionDuration: afterLongSession,
    } = data
    return {
      validation,
      flipLottery,
      shortSession,
      longSession,
      afterLongSession,
    }
  }
  return {
    validation: null,
    flipLottery: null,
    shortSession: null,
    longSession: null,
    afterLongSession: null,
  }
}
