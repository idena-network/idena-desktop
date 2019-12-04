import React from 'react'
import {useRpc} from '../api/api-client'

export const EpochPeriod = {
  FlipLottery: 'FlipLottery',
  ShortSession: 'ShortSession',
  LongSession: 'LongSession',
  AfterLongSession: 'AfterLongSession',
  None: 'None',
}

const EpochStateContext = React.createContext()

export function EpochProvider(props) {
  const {data} = useRpc('dna_epoch')
  return <EpochStateContext.Provider value={data} {...props} />
}

export function useEpochState() {
  const context = React.useContext(EpochStateContext)
  if (context === undefined) {
    throw new Error('EpochState must be used within a EpochProvider')
  }
  return context
}
