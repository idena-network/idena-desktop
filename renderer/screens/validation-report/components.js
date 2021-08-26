/* eslint-disable react/prop-types */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  CloseButton,
  Flex,
  Icon,
  Skeleton,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useTheme,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {SmallText, TextLink} from '../../shared/components/components'
import {TableCol} from '../../shared/components/table'
import {useIdentity} from '../../shared/providers/identity-context'
import {toLocaleDna, toPercent} from '../../shared/utils/utils'
import {useValidationReportSummary} from './hooks'
import {ValidationFailReason} from './types'

export function ValidationReportSummary({onClose}) {
  const {t, i18n} = useTranslation()

  const {colors} = useTheme()

  const [{isValidated}] = useIdentity()

  const {
    lastValidationScore,
    totalScore,
    earnings,
    earningsScore,
    totalMissedReward,
    didMissValidation,
    validationPenalty,
    isLoading,
  } = useValidationReportSummary()

  const {
    short: {score: shortScore, options: shortAnswersCount},
  } = lastValidationScore

  // eslint-disable-next-line no-nested-ternary
  const validationFailReason = didMissValidation
    ? shortAnswersCount
      ? ValidationFailReason.LateSubmission
      : ValidationFailReason.MissedValidation
    : ValidationFailReason.WrongAnswers

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})

  return (
    <Alert
      status={isValidated ? 'success' : 'error'}
      variant="top-accent"
      bg="white"
      borderTopColor={
        // eslint-disable-next-line no-nested-ternary
        isValidated
          ? validationPenalty
            ? 'orange.500'
            : 'green.500'
          : 'red.500'
      }
      borderRadius="md"
      boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
      px={8}
      py={6}
    >
      <CloseButton
        w={6}
        h={6}
        pos="absolute"
        top={3}
        right={3}
        onClick={onClose}
      />
      <Stack spacing={6} w="full">
        <Skeleton
          isLoaded={!isLoading}
          colorStart={colors.gray[50]}
          colorEnd={colors.gray[300]}
          alignSelf="start"
        >
          <AlertTitle fontSize="lg" fontWeight={500}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isValidated
              ? validationPenalty
                ? t('Validated')
                : t('Successfully validated')
              : t('Validation failed')}
          </AlertTitle>
        </Skeleton>
        <AlertDescription>
          <Stack spacing={10}>
            <Flex justify="space-between" px={2}>
              <ValidationReportGauge>
                <ValidationReportGaugeBox>
                  {isValidated ? (
                    <ValidationReportGaugeBar
                      value={totalScore * 100}
                      color={
                        // eslint-disable-next-line no-nested-ternary
                        totalScore <= 0.75
                          ? colors.red[500]
                          : totalScore <= 0.9
                          ? colors.orange[500]
                          : colors.green[500]
                      }
                    />
                  ) : (
                    <ValidationReportGaugeBar
                      value={shortScore || 2}
                      color={colors.red[500]}
                    />
                  )}
                  <ValidationReportGaugeIcon icon="timer" />
                </ValidationReportGaugeBox>
                <ValidationReportGaugeStat>
                  {isValidated ? (
                    <ValidationReportGaugeStatValue>
                      {toPercent(totalScore)}
                    </ValidationReportGaugeStatValue>
                  ) : (
                    <ValidationReportGaugeStatValue color="red.500">
                      {t('Failed')}
                    </ValidationReportGaugeStatValue>
                  )}
                  <ValidationReportGaugeStatLabel>
                    {isValidated
                      ? t('Score')
                      : (() => {
                          switch (validationFailReason) {
                            case ValidationFailReason.LateSubmission:
                              return t('Late submission')
                            case ValidationFailReason.MissedValidation:
                              return t('Missed validation')
                            case ValidationFailReason.WrongAnswers:
                              return t('Wrong answers')
                            default:
                              return ''
                          }
                        })()}
                  </ValidationReportGaugeStatLabel>
                </ValidationReportGaugeStat>
              </ValidationReportGauge>
              <ValidationReportGauge>
                <ValidationReportGaugeBox>
                  {isValidated ? (
                    <ValidationReportGaugeBar
                      value={earningsScore * 100 || 2}
                      color={
                        // eslint-disable-next-line no-nested-ternary
                        earningsScore <= 0.5
                          ? colors.red[500]
                          : earningsScore <= 0.75
                          ? colors.orange[500]
                          : colors.green[500]
                      }
                    />
                  ) : (
                    <ValidationReportGaugeBar
                      value={2}
                      color={colors.red[500]}
                    />
                  )}
                  <ValidationReportGaugeIcon icon="send-out" />
                </ValidationReportGaugeBox>
                <ValidationReportGaugeStat>
                  {isValidated ? (
                    <ValidationReportGaugeStatValue>
                      {dna(earnings)}
                    </ValidationReportGaugeStatValue>
                  ) : (
                    <ValidationReportGaugeStatValue color="red.500">
                      {dna(totalMissedReward)}
                    </ValidationReportGaugeStatValue>
                  )}
                  <ValidationReportGaugeStatLabel>
                    {t('Earnings')}
                  </ValidationReportGaugeStatLabel>
                </ValidationReportGaugeStat>
              </ValidationReportGauge>
            </Flex>
            <Flex justify="space-between">
              <Box>
                <TextLink
                  href="/validation-report"
                  fontWeight={500}
                  display="inline-block"
                >
                  <Stack isInline spacing={0} align="center">
                    <Text as="span">{t('More details')}</Text>
                    <Icon
                      name="chevron-down"
                      size={4}
                      transform="rotate(-90deg)"
                    />
                  </Stack>
                </TextLink>
              </Box>
              <Stack isInline color="muted">
                <Icon name="twitter" size={4} />
                <Icon name="telegram" size={4} />
                <Icon name="github" size={4} />
              </Stack>
            </Flex>
          </Stack>
        </AlertDescription>
      </Stack>
    </Alert>
  )
}

export function ValidationReportGauge(props) {
  return <Stack spacing={0} align="center" {...props} />
}

export function ValidationReportGaugeBox(props) {
  return <Box h={103} position="relative" {...props} />
}

export function ValidationReportGaugeStat(props) {
  return <Stack as={Stat} spacing={1} align="center" pr={0} {...props} />
}

export function ValidationReportGaugeStatLabel(props) {
  return <StatLabel color="muted" fontSize="mdx" fontWeight={500} {...props} />
}

export function ValidationReportGaugeStatValue(props) {
  return <StatNumber fontSize="lg" fontWeight={500} {...props} />
}

export function ValidationReportGaugeBar({value, bg, color}) {
  const {colors} = useTheme()

  const radius = 84
  const innerRadius = 80
  const circumference = innerRadius * 2 * Math.PI
  const angle = 205

  const arc = circumference * (angle / 360)
  const dashArray = `${arc} ${circumference}`
  const transform = `rotate(${180 -
    Math.max(angle - 180, 0) / 2}, ${radius}, ${radius})`

  const percentNormalized = Math.min(Math.max(value, 0), 100)
  const offset = arc - (percentNormalized / 100) * arc

  return (
    <svg
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      width={radius * 2}
      height={radius * 2}
    >
      <circle
        cx={radius}
        cy={radius}
        fill="transparent"
        r={innerRadius}
        stroke={bg || colors.gray[50]}
        strokeWidth={4}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        transform={transform}
      />
      <circle
        cx={radius}
        cy={radius}
        fill="transparent"
        r={innerRadius}
        stroke={color}
        strokeWidth={4}
        strokeDasharray={dashArray}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={transform}
      />
    </svg>
  )
}

export function ValidationReportGaugeIcon({
  icon,
  bg = 'gray.50',
  color = 'muted',
  ...props
}) {
  return (
    <Box
      bg={bg}
      p="10px"
      borderRadius="lg"
      pos="absolute"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      {...props}
    >
      <Icon name={icon} size={5} color={color} />
    </Box>
  )
}

export function ValidationReportBlockOverview(props) {
  return <Box flex={1} bg="gray.50" borderRadius="md" p={10} {...props} />
}

export function ValidationReportStat({label, value, ...props}) {
  return (
    <Stat pr={0} {...props}>
      <StatLabel color="muted" fontSize="md" fontWeight={400}>
        {label}
      </StatLabel>
      <StatNumber fontSize="md" fontWeight={500}>
        {value}
      </StatNumber>
    </Stat>
  )
}

export function ValidationReportColumn(props) {
  return <Box as={TableCol} fontWeight={500} {...props} />
}

export function ValidationReportCategoryLabel({label, description, ...props}) {
  return (
    <Box fontWeight={500} {...props}>
      {label}
      <SmallText>{description}</SmallText>
    </Box>
  )
}
