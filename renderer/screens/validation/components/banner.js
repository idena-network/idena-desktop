import React from 'react'
import {padding, rem, backgrounds} from 'polished'

import {useMachine} from '@xstate/react'
import dayjs from 'dayjs'
import {Box, Text, Fill, Link} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Divider from '../../../shared/components/divider'
import {
  useValidationState,
  SessionType,
} from '../../../shared/providers/validation-context'
import {
  useEpochState,
  EpochPeriod,
} from '../../../shared/providers/epoch-context'
import {useValidationTimer} from '../../../shared/hooks/use-validation-timer'
import {useIdentityState} from '../../../shared/providers/identity-context'
import Timer, {Countdown} from './timer'
import {shouldStartValidation, createTimerMachine} from '../machine'

function Banner() {
  const epoch = useEpochState()

  if (!epoch) {
    return null
  }

  const {currentPeriod} = epoch
  const isValidation = [
    EpochPeriod.ShortSession,
    EpochPeriod.LongSession,
  ].includes(currentPeriod)
  return (
    <Box>
      {currentPeriod === EpochPeriod.FlipLottery && <ValidationSoon />}
      {isValidation && <ValidationRunning />}
      {currentPeriod === EpochPeriod.AfterLongSession && <AfterLongSession />}
    </Box>
  )
}

function ValidationSoon() {
  return (
    <Flex
      align="center"
      css={{
        ...backgrounds(theme.colors.danger),
        minHeight: rem(56),
      }}
    >
      <ValidationSoonTimer />
      <Text
        color={theme.colors.white}
        fontWeight={500}
        css={{
          ...padding(rem(16), rem(28), rem(24)),
        }}
      >
        Idena validation will start soon
      </Text>
    </Flex>
  )
}

function ValidationSoonTimer() {
  const {nextValidation} = useEpochState()

  console.log(nextValidation, dayjs(nextValidation).diff(dayjs(), 's'))
  const timerMachine = React.useMemo(
    () => createTimerMachine(dayjs(nextValidation).diff(dayjs(), 's')),
    [nextValidation]
  )
  const [current] = useMachine(timerMachine)
  const {
    context: {duration, elapsed},
  } = current

  return (
    <Box
      width={rem(120)}
      style={{
        fontVariantNumeric: 'tabular-nums',
        ...padding(rem(16), rem(28), rem(24)),
        position: 'relative',
        zIndex: 0,
      }}
    >
      <Countdown
        seconds={Math.ceil(Math.max(duration - elapsed, 0))}
        color={theme.colors.white}
        fontWeight={500}
      />
      <Fill bg="rgba(0,0,0,0.1)" zIndex={-1} />
    </Box>
  )
}

function ValidationRunning() {
  const epoch = useEpochState()
  const {currentPeriod} = epoch
  const {shortAnswers, longAnswers} = useValidationState()

  const isShortSession = currentPeriod === EpochPeriod.ShortSession
  const sessionType = isShortSession ? SessionType.Short : SessionType.Long
  const hasAnswers = isShortSession ? shortAnswers.length : longAnswers.length

  const {
    secondsLeftForShortSession,
    secondsLeftForLongSession,
  } = useValidationTimer()

  const identity = useIdentityState()

  const seconds = isShortSession
    ? secondsLeftForShortSession
    : secondsLeftForLongSession

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
            minHeight: rem(56),
          }}
        >
          <Timer
            type={sessionType}
            color={theme.colors.white}
            useIcon={false}
          />
          <Fill bg="rgba(0,0,0,0.1)" />
        </Flex>
        {hasAnswers ? (
          <Box p={theme.spacings.normal}>
            Waiting for the end of {currentPeriod}
          </Box>
        ) : (
          <Box p={theme.spacings.normal}>
            {!isShortSession || seconds > 0
              ? `Idena ${currentPeriod} has started`
              : `Submitting answers for ${currentPeriod}`}
          </Box>
        )}
      </Flex>
      {shouldStartValidation(epoch, identity) && (
        <Flex css={padding(theme.spacings.normal)}>
          <Divider vertical m={rem(theme.spacings.medium16)} />
          <Link href="/validation">
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

function AfterLongSession() {
  return (
    <Box
      bg={theme.colors.success}
      p={rem(theme.spacings.medium16)}
      css={{minHeight: rem(56)}}
    >
      <Text color={theme.colors.white}>
        Please wait. The network is reaching consensus about validated
        identities
      </Text>
    </Box>
  )
}

export default Banner
