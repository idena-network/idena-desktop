import React, {useEffect} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import useSessionStorage from 'react-use/lib/useSessionStorage'
import {Absolute, Box, Text, Fill, Link} from '../../../../shared/components'
import useTiming from '../../../../shared/utils/useTiming'
import useEpoch, {EpochPeriod} from '../../../../shared/utils/useEpoch'
import useValidation from '../../../../shared/utils/useValidation'
import theme from '../../../../shared/theme'
import useTimer from '../utils/useTimer'
import Flex from '../../../../shared/components/flex'

function ValidationBanner({time, shouldCallToValidate, children}) {
  const [timer, setTimer] = useSessionStorage('idena/timer', time)
  const {seconds} = useTimer({seconds: timer || time})

  useEffect(() => {
    setTimer(seconds)
  }, [seconds, setTimer])

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

function Banner({router}) {
  const {flipLottery, shortSession, longSession} = useTiming()
  const {currentPeriod} = useEpoch()
  const {shortAnswers, longAnswers} = useValidation()

  const matchValidation = router.pathname.startsWith('/validation')

  const isCeremonyRunning =
    currentPeriod === EpochPeriod.ShortSession ||
    currentPeriod === EpochPeriod.LongSession
  const noAnswers = shortAnswers.length === 0 || longAnswers.length === 0

  return !matchValidation ? (
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
          time={
            currentPeriod === EpochPeriod.ShortSession
              ? shortSession
              : longSession
          }
          shouldCallToValidate={isCeremonyRunning}
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
