import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'next/router'
import dayjs from 'dayjs'
import {Absolute, Box, Text, Fill, Link} from '../../../../shared/components'
import useTiming from '../../../../shared/utils/use-timing'
import theme from '../../../../shared/theme'
import Flex from '../../../../shared/components/flex'
import {useInterval} from '../utils/useInterval'
import {useValidationState} from '../../../../shared/providers/validation-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../../shared/providers/epoch-context'

// eslint-disable-next-line react/prop-types
function Banner({router}) {
  const {shortSession, longSession} = useTiming()
  const epoch = useEpochState()
  const {shortAnswers, longAnswers} = useValidationState()

  const matchValidation = router.pathname.startsWith('/validation')
  if (epoch === null || matchValidation) {
    return null
  }

  const {currentPeriod, currentValidationStart} = epoch

  if (currentPeriod === EpochPeriod.FlipLottery) {
    return (
      <Absolute bottom={0} left={0} right={0}>
        <Box bg={theme.colors.danger} p={theme.spacings.normal}>
          <Text color={theme.colors.white}>
            {`Validation starts in a few seconds`}
          </Text>
        </Box>
      </Absolute>
    )
  }

  if (
    [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
      currentPeriod
    ) &&
    shortSession &&
    longSession
  ) {
    const hasAnswers = shortAnswers.length === 0 || longAnswers.length === 0

    const duration =
      currentPeriod === EpochPeriod.ShortSession
        ? shortSession
        : shortSession + longSession

    const finish = dayjs(currentValidationStart).add(duration, 's')

    return (
      <Absolute bottom={0} left={0} right={0}>
        <Countdown
          key={currentPeriod}
          seconds={finish.diff(dayjs(), 's')}
          willValidate={hasAnswers}
          period={currentPeriod}
        >
          {hasAnswers
            ? `${currentPeriod} running`
            : `Waiting for the end of ${currentPeriod}`}
        </Countdown>
      </Absolute>
    )
  }

  return null
}

function Countdown({seconds: initalSeconds, willValidate, period, children}) {
  const [seconds, setSeconds] = React.useState(initalSeconds)

  useInterval(
    () => {
      setSeconds(seconds - 1)
    },
    seconds > 0 ? 1000 : null
  )

  const isShortSession = period === EpochPeriod.ShortSession
  const href = `/validation/${isShortSession ? 'short' : 'long'}`

  return (
    <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
      <Flex justify="space-between" align="center">
        <Flex>
          <Box p={theme.spacings.normal} css={{position: 'relative'}}>
            {seconds} seconds left
            <Fill bg="rgba(0,0,0,0.1)" css={{display: 'none'}}>
              &nbsp;
            </Fill>
          </Box>
          <Box p={theme.spacings.normal}>{children}</Box>
        </Flex>
        {willValidate && (
          <Box p={theme.spacings.normal}>
            <Link href={href} color={theme.colors.white}>
              Validate
            </Link>
          </Box>
        )}
      </Flex>
    </Box>
  )
}

Countdown.propTypes = {
  seconds: PropTypes.number.isRequired,
  willValidate: PropTypes.bool.isRequired,
  period: PropTypes.string,
  children: PropTypes.node,
}

export default withRouter(Banner)
