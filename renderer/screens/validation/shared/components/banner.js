import React from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import {Absolute, Box, Text, Fill, Link} from '../../../../shared/components'
import useTiming from '../../../../shared/utils/useTiming'
import useEpoch, {EpochPeriod} from '../../../../shared/utils/useEpoch'
import useValidation from '../../../../shared/utils/useValidation'
import theme from '../../../../shared/theme'
import Flex from '../../../../shared/components/flex'
import {useInterval} from '../utils/useInterval'

function Banner() {
  const {flipLottery, shortSession, longSession} = useTiming()
  const {currentPeriod, nextValidation} = useEpoch()
  const {shortAnswers, longAnswers} = useValidation()

  const isCeremonyRunning =
    currentPeriod === EpochPeriod.ShortSession ||
    currentPeriod === EpochPeriod.LongSession

  const noAnswers = shortAnswers.length === 0 || longAnswers.length === 0

  let ceremonyDuration = 0
  if (isCeremonyRunning) {
    ceremonyDuration =
      flipLottery + currentPeriod === EpochPeriod.ShortSession
        ? shortSession
        : shortSession + longSession
  }

  const currentDate = dayjs()
  let validationEnd = dayjs(nextValidation)
  if (isCeremonyRunning && ceremonyDuration) {
    validationEnd = validationEnd.add(ceremonyDuration, 's')
  }

  return (
    <Absolute bottom={0} left={0} right={0}>
      {currentPeriod === EpochPeriod.FlipLottery && (
        <Box bg={theme.colors.danger} p={theme.spacings.normal}>
          <Text color={theme.colors.white}>
            {`Validation starts in ${flipLottery} sec`}
          </Text>
        </Box>
      )}
      {isCeremonyRunning && (
        <ValidationBanner
          time={validationEnd.diff(currentDate, 's')}
          shouldCallToValidate={isCeremonyRunning && noAnswers}
        >
          {noAnswers
            ? `${currentPeriod} running`
            : `Waiting for the end of ${currentPeriod}`}
        </ValidationBanner>
      )}
    </Absolute>
  )
}

function ValidationBanner({time: initialTime, shouldCallToValidate, children}) {
  const [time, setTime] = React.useState(initialTime)

  useInterval(
    () => {
      setTime(time - 1)
    },
    time > 0 ? 1000 : null
  )

  return (
    <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
      <Flex justify="space-between" align="center">
        <Flex>
          <Box p={theme.spacings.normal} css={{position: 'relative'}}>
            {time} seconds left
            <Fill bg="rgba(0,0,0,0.1)" css={{display: 'none'}}>
              &nbsp;
            </Fill>
          </Box>
          <Box p={theme.spacings.normal}>{children}</Box>
        </Flex>
        {shouldCallToValidate && (
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

ValidationBanner.propTypes = {
  time: PropTypes.number.isRequired,
  shouldCallToValidate: PropTypes.bool.isRequired,
  children: PropTypes.node,
}

export default Banner
