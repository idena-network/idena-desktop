/* eslint-disable react/prop-types */
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  CloseButton,
  Flex,
  Icon,
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

export function ValidationReportSummary(props) {
  const {t, i18n} = useTranslation()

  const {colors} = useTheme()

  const [{isValidated}] = useIdentity()

  const {score, earnings, earningsScore} = useValidationReportSummary()

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})

  return (
    <Alert
      variant="top-accent"
      bg="white"
      boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
      borderRadius="md"
      px={8}
      py={6}
      {...props}
    >
      <CloseButton w={6} h={6} pos="absolute" top={3} right={3} />
      <Stack spacing={6} w="full">
        <AlertTitle fontSize="lg" fontWeight={500}>
          {isValidated ? t('Successfully validated') : t('Validation failed')}
        </AlertTitle>
        <AlertDescription>
          <Stack spacing={10}>
            <Flex justify="space-between">
              <ValidationReportGauge
                label={t('Score')}
                value={toPercent(score)}
                percentValue={score * 100}
                icon="timer"
                color={
                  colors[
                    // eslint-disable-next-line no-nested-ternary
                    score <= 0.75 ? 'red' : isValidated ? 'green' : 'orange'
                  ][500]
                }
              />
              <ValidationReportGauge
                label={t('Earnings')}
                value={dna(earnings)}
                percentValue={earningsScore * 100}
                icon="send-out"
                color={
                  colors[
                    // eslint-disable-next-line no-nested-ternary
                    earningsScore <= 0.5
                      ? 'red'
                      : score < 0.75
                      ? 'orange'
                      : 'green'
                  ][500]
                }
              />
            </Flex>
            <Flex justify="space-between">
              <Box>
                <TextLink href="/validation-report" fontWeight={500}>
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

export function ValidationReportGauge({
  label,
  value,
  percentValue,
  icon,
  color = 'gray',
  placeholderColor,
}) {
  return (
    <Stack spacing={0} align="center">
      <Box h={103} pos="relative">
        <GaugeBar
          percent={percentValue}
          color={color}
          placeholderColor={placeholderColor}
        />
        {typeof icon === 'string' ? (
          <ValidationReportGaugeIcon icon={icon} />
        ) : (
          icon
        )}
      </Box>
      <Stack spacing={1} align="center">
        <Box fontSize="lg" fontWeight={500}>
          {value}
        </Box>
        <Box color="muted" fontSize="mdx">
          {label}
        </Box>
      </Stack>
    </Stack>
  )
}

function GaugeBar({percent, color, placeholderColor}) {
  const {colors} = useTheme()

  const radius = 84
  const innerRadius = 80
  const circumference = innerRadius * 2 * Math.PI
  const angle = 205

  const arc = circumference * (angle / 360)
  const dashArray = `${arc} ${circumference}`
  const transform = `rotate(${180 -
    Math.max(angle - 180, 0) / 2}, ${radius}, ${radius})`

  const percentNormalized = Math.min(Math.max(percent, 0), 100)
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
        stroke={placeholderColor || colors.gray[50]}
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

export function ValidationReportGaugeIcon({icon, bg = 'gray.50', ...props}) {
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
      <Icon name={icon} size={5} color="muted" />
    </Box>
  )
}

export function ValidationReportBlockOverview(props) {
  return <Box flex={1} bg="gray.50" borderRadius="md" p={10} {...props} />
}

export function ValidationReportStat({label, value, ...props}) {
  return (
    <Stat {...props}>
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
