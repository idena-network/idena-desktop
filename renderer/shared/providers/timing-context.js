import React from 'react'
import {useRpc} from '../api/api-client'
import {OfflineApp} from '../components/syncing-app'

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const {data, isLoading} = useRpc('dna_ceremonyIntervals')

  if (data === null || isLoading) return <OfflineApp />
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
