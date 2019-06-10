import React, {useEffect} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import {Absolute, Box, Text, Fill, Link} from '../../../../shared/components'
import useTiming from '../../../../shared/utils/useTiming'
import useEpoch, {EpochPeriod} from '../../../../shared/utils/useEpoch'
import useValidation from '../../../../shared/utils/useValidation'
import theme from '../../../../shared/theme'
import useTimer from '../utils/useTimer'
import Flex from '../../../../shared/components/flex'

function ValidationBanner({shouldCallToValidate, seconds, onTick, children}) {
  const {secondsLeft} = useTimer({seconds})

  useEffect(() => {
    if (onTick) {
      onTick(secondsLeft)
    }
  }, [onTick, secondsLeft])

  return (
    <Box bg={theme.colors.primary} css={{color: theme.colors.white}}>
      <Flex justify="space-between" align="center">
        <Flex>
          <Box p={theme.spacings.normal} css={{position: 'relative'}}>
            {secondsLeft} seconds left
            <Fill bg="rgba(0,0,0,0.1)" css={{display: 'none'}}>
              &nbsp;
            </Fill>
          </Box>
          <Box p={theme.spacings.normal}>{children}</Box>
        </Flex>
        <Box p={theme.spacings.normal}>
          {shouldCallToValidate && (
            <Link href="/validation/short" color={theme.colors.white}>
              Validate
            </Link>
          )}
        </Box>
      </Flex>
    </Box>
  )
}

ValidationBanner.propTypes = {
  shouldCallToValidate: PropTypes.bool.isRequired,
  seconds: PropTypes.number.isRequired,
  onTick: PropTypes.func,
}

function Banner({router}) {
  const timing = useTiming()
  const {currentPeriod} = useEpoch()
  const {shortAnswers, longAnswers} = useValidation()

  const matchValidationRoute = router.pathname.startsWith('/validation')
  const isCeremonyRunning =
    currentPeriod === EpochPeriod.ShortSession ||
    currentPeriod === EpochPeriod.LongSession
  const noAnswers =
    isCeremonyRunning && (shortAnswers.length === 0 || longAnswers.length === 0)

  return matchValidationRoute ? (
    <Absolute bottom={0} left={0} right={0}>
      {currentPeriod === EpochPeriod.FlipLottery && (
        <Box bg={theme.colors.danger} p={theme.spacings.normal}>
          <Text color={theme.colors.white}>
            {`Validation starts in ${timing.flipLottery} sec`}
          </Text>
        </Box>
      )}
      {isCeremonyRunning && (
        <ValidationBanner
          seconds={timing.shortSession}
          onTick={sec => {
            console.log(sec)
          }}
          shouldCallToValidate={noAnswers}
        >
          {noAnswers
            ? `${currentPeriod} running`
            : `Waiting for the end of ${currentPeriod}`}
        </ValidationBanner>
      )}
    </Absolute>
  ) : null
}

Banner.propTypes = {
  router: PropTypes.shape({pathname: PropTypes.string}),
}

export default withRouter(Banner)
