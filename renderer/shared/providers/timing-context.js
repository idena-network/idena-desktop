import React from 'react'
import useTiming from '../hooks/use-timing'
import {useAppMachine} from './app-context'

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const timing = useTiming()
  return <TimingStateContext.Provider value={timing} {...props} />
}

export function useTimingState() {
  const [{context}] = useAppMachine()
  return context.ceremonyIntervals
}
