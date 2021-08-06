import React from 'react'
import {apiUrl} from '../../screens/oracles/utils'
import {fetchCeremonyIntervals} from '../api/dna'
import {useInterval} from '../hooks/use-interval'
import {ntp} from '../utils/utils'

const TIME_DRIFT_THRESHOLD = 10 * 1000

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const [timing, setTiming] = React.useState({
    validation: null,
    flipLottery: null,
    shortSession: null,
    longSession: null,
  })

  const [interval, setInterval] = React.useState(1000 * 60)

  useInterval(
    async () => {
      try {
        const {
          ValidationInterval: validation,
          FlipLotteryDuration: flipLottery,
          ShortSessionDuration: shortSession,
          LongSessionDuration: longSession,
        } = await fetchCeremonyIntervals()

        setTiming({
          validation,
          flipLottery,
          shortSession,
          longSession,
        })
        setInterval(1000 * 60 * 1)
      } catch (error) {
        setInterval(1000 * 5 * 1)
        global.logger.error(
          'An error occured while fetching ceremony intervals',
          error.message
        )
      }
    },
    interval,
    true
  )

  const [wrongClientTime, setWrongClientTime] = React.useState()

  useInterval(
    async () => {
      try {
        const requestOriginTime = Date.now()

        const {result} = await (await fetch(apiUrl('now'))).json()
        const serverTime = new Date(result)

        setWrongClientTime(
          ntp(requestOriginTime, serverTime, serverTime, Date.now()).offset >
            TIME_DRIFT_THRESHOLD
        )
      } catch {
        global.logger.error('An error occured while fetching time API')
      }
    },
    1000 * 60 * 1,
    true
  )

  React.useEffect(() => {
    setTiming(prevTiming => ({
      ...prevTiming,
      wrongClientTime,
    }))
  }, [wrongClientTime])

  return <TimingStateContext.Provider value={timing} {...props} />
}

export function useTimingState() {
  const context = React.useContext(TimingStateContext)
  if (context === undefined) {
    throw new Error('useTimingState must be used within a TimingProvider')
  }
  return context
}
