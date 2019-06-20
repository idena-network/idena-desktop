import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import {Absolute, Box, Text, Fill, Link} from '../../../../shared/components'
import useTiming from '../../../../shared/utils/useTiming'
import useEpoch, {EpochPeriod} from '../../../../shared/utils/useEpoch'
import theme from '../../../../shared/theme'
import Flex from '../../../../shared/components/flex'
import {useInterval} from '../utils/useInterval'
import {useValidationState} from '../../../../shared/providers/validation-context'

function Banner() {
  const {flipLottery, shortSession, longSession} = useTiming()
  const {currentPeriod, nextValidation} = useEpoch()
  const {shortAnswers, longAnswers} = useValidationState()

  if (!currentPeriod) {
    return null
  }

  if (currentPeriod === EpochPeriod.FlipLottery) {
    return (
      <Absolute bottom={0} left={0} right={0}>
        <Box bg={theme.colors.danger} p={theme.spacings.normal}>
          <Text color={theme.colors.white}>
            {`Validation starts in ${flipLottery} sec`}
          </Text>
        </Box>
      </Absolute>
    )
  }

  if (
    [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(currentPeriod)
  ) {
    const hasAnswers = shortAnswers.length === 0 || longAnswers.length === 0

    const duration =
      currentPeriod === EpochPeriod.ShortSession
        ? shortSession
        : shortSession + longSession

    const finish = dayjs(nextValidation).add(duration, 's')

    return (
      <Absolute bottom={0} left={0} right={0}>
        <Countdown
          key={currentPeriod}
          seconds={finish.diff(dayjs(), 's')}
          willValidate={hasAnswers}
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

function Countdown({seconds: initalSeconds, willValidate, children}) {
  const [seconds, setSeconds] = React.useState(initalSeconds)

  useInterval(
    () => {
      setSeconds(seconds - 1)
    },
    seconds > 0 ? 1000 : null
  )

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
            <Link href="/validation/short" color={theme.colors.white}>
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
  children: PropTypes.node,
}

export default Banner
