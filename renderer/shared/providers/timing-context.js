import React from 'react'
import useTiming from '../hooks/use-timing'

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const timing = useTiming()
  return <TimingStateContext.Provider value={timing} {...props} />
}

export function useTimingState() {
  const context = React.useContext(TimingStateContext)
  if (context === undefined) {
    throw new Error('useTimingState must be used within a TimingProvider')
  }
  return context
}
