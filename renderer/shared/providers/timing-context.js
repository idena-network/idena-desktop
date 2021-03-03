/* eslint-disable react/prop-types */
import {useToast} from '@chakra-ui/core'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {fetchCeremonyIntervals} from '../api'
import {Toast} from '../components/components'
import {useInterval} from '../hooks/use-interval'

const TIME_DRIFT_THRESHOLD = 10 * 1000

const TimingStateContext = React.createContext()

export function TimingProvider(props) {
  const {t} = useTranslation()

  const toast = useToast()

  const [timing, setTiming] = React.useState({
    validation: null,
    flipLottery: null,
    shortSession: null,
    longSession: null,
    none: null,
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
      const {datetime} = await (
        await fetch('http://worldtimeapi.org/api/ip')
      ).json()

      // same as within the node = 10 sec
      setWrongClientTime(
        Math.abs(new Date() - new Date(datetime)) > TIME_DRIFT_THRESHOLD
      )
    },
    1000 * 60 * 1,
    true
  )

  React.useEffect(() => {
    if (wrongClientTime)
      toast({
        duration: null,
        // eslint-disable-next-line react/display-name
        render: ({onClose}) => (
          <Toast
            status="error"
            title={t('Please check your local clock')}
            description={t('The time must be synchronized with internet time')}
            actionContent={t('Okay')}
            onAction={() => {
              onClose()
              global.openExternal('https://time.is/')
            }}
          />
        ),
      })
  }, [t, toast, wrongClientTime])

  return <TimingStateContext.Provider value={timing} {...props} />
}

export function useTimingState() {
  const context = React.useContext(TimingStateContext)
  if (context === undefined) {
    throw new Error('useTimingState must be used within a TimingProvider')
  }
  return context
}
