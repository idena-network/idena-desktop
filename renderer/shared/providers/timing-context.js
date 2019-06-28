/* eslint-disable no-shadow */
import React from 'react'
import useTiming from '../utils/use-timing'

const TimingStateContext = React.createContext()

// eslint-disable-next-line react/prop-types
function TimingProvider({children}) {
  const timing = useTiming()
  return (
    <TimingStateContext.Provider value={timing}>
      {children}
    </TimingStateContext.Provider>
  )
}

function useTimingState() {
  const context = React.useContext(TimingStateContext)
  if (context === undefined) {
    throw new Error('useTimingState must be used within a TimingProvider')
  }
  return context
}

export {TimingProvider, useTimingState}
