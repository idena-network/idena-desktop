import React from 'react'
import {withRouter} from 'next/router'
import {Absolute, Box, Text, Fill, Link} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import {useValidationState} from '../../../shared/providers/validation-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'
import {useValidationTimer} from '../../../shared/hooks/use-validation'

const matchValidation = path => path.startsWith('/validation')

// eslint-disable-next-line react/prop-types
function Banner({router}) {
  const epoch = useEpochState()

  if (epoch === null || matchValidation(router.pathname)) {
    return null
  }

  const {currentPeriod} = epoch
  if (
    [
      EpochPeriod.FlipLottery,
      EpochPeriod.ShortSession,
      EpochPeriod.LongSession,
    ].includes(currentPeriod)
  ) {
    return (
      <Absolute bottom={0} left={0} right={0} zIndex={3}>
        {currentPeriod === EpochPeriod.FlipLottery ? (
          <Box bg={theme.colors.danger} p={theme.spacings.normal}>
            <Text color={theme.colors.white}>
              {`Validation starts in a few seconds`}
            </Text>
          </Box>
        ) : (
          <Countdown />
        )}
      </Absolute>
    )
  }

  return null
}

function Countdown() {
  const seconds = useValidationTimer()

  const epoch = useEpochState()
  const {shortAnswers, longAnswers} = useValidationState()

  if (epoch === null) {
    return null
  }

  const isShortSession = epoch.currentPeriod === EpochPeriod.ShortSession
  const hasAnswers = isShortSession ? shortAnswers.length : longAnswers.length

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
          <Box p={theme.spacings.normal}>
            {hasAnswers
              ? `Waiting for the end of ${epoch.currentPeriod}`
              : `${epoch.currentPeriod} running`}
          </Box>
        </Flex>
        {!hasAnswers && (
          <Box p={theme.spacings.normal}>
            <Link
              href={`/validation/${isShortSession ? 'short' : 'long'}`}
              color={theme.colors.white}
            >
              Validate
            </Link>
          </Box>
        )}
      </Flex>
    </Box>
  )
}

export default withRouter(Banner)
