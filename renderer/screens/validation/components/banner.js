import React from 'react'
import {withRouter} from 'next/router'
import {padding, rem, backgrounds} from 'polished'
import {Absolute, Box, Text, Fill, Link} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Divider from '../../../shared/components/divider'
import {useValidationState} from '../../../shared/providers/validation-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'
import {useValidationTimer} from '../../../shared/hooks/use-validation'
import Timer from './timer'

function Banner() {
  const epoch = useEpochState()

  if (epoch) {
    const {currentPeriod} = epoch
    return (
      <Absolute top={0} left={0} right={0} zIndex={3}>
        {currentPeriod === EpochPeriod.FlipLottery && <ValidationSoon />}
        {[EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
          currentPeriod
        ) && <ValidationRunning />}
      </Absolute>
    )
  }

  return null
}

function ValidationSoon() {
  return (
    <Box
      bg={theme.colors.danger}
      p={rem(theme.spacings.medium16)}
      css={{minHeight: rem(56)}}
    >
      <Text color={theme.colors.white}>Idena validation will start soon</Text>
    </Box>
  )
}

function ValidationRunning() {
  const seconds = useValidationTimer()

  const {currentPeriod} = useEpochState()
  const {shortAnswers, longAnswers} = useValidationState()

  const isShortSession = currentPeriod === EpochPeriod.ShortSession
  const hasAnswers = isShortSession ? shortAnswers.length : longAnswers.length

  return (
    <Flex
      justify="space-between"
      align="center"
      css={{
        ...backgrounds(theme.colors.primary),
        color: theme.colors.white,
        minHeight: rem(56),
      }}
    >
      <Flex align="center">
        <Flex
          justify="center"
          width={rem(120)}
          css={{
            ...padding(rem(theme.spacings.medium16)),
            position: 'relative',
          }}
        >
          <Timer color={theme.colors.white} useIcon={false} />
          <Fill bg="rgba(0,0,0,0.1)" />
        </Flex>
        {hasAnswers ? (
          <Box p={theme.spacings.normal}>
            Waiting for the end of {currentPeriod}
          </Box>
        ) : (
          <Box p={theme.spacings.normal}>
            {seconds > 0
              ? `Idena ${currentPeriod} has started`
              : `Submitting answers for ${currentPeriod}`}
          </Box>
        )}
      </Flex>
      {!hasAnswers && !!seconds && (
        <Flex css={padding(theme.spacings.normal)}>
          <Divider vertical m={rem(theme.spacings.medium16)} />
          <Link href={`/validation/${isShortSession ? 'short' : 'long'}`}>
            <Text
              color={theme.colors.white}
              fontWeight={theme.fontWeights.semi}
            >
              Validate
            </Text>
          </Link>
        </Flex>
      )}
    </Flex>
  )
}

export default withRouter(Banner)
