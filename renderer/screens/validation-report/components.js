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
  Text,
  useTheme,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {TextLink} from '../../shared/components/components'
import {toLocaleDna, toPercent} from '../../shared/utils/utils'
import {useValidationReportSummary} from './hooks'

export function ValidationReportAlert(props) {
  const {t, i18n} = useTranslation()

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})

  const {score, earnings, earningsScore} = useValidationReportSummary()

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
          {t('Successfully validated')}
        </AlertTitle>
        <AlertDescription>
          <Stack spacing={10}>
            <Flex justify="space-between">
              <Gauge
                label={t('Score')}
                value={toPercent(score)}
                percentValue={score * 100}
                icon="timer"
                color="green.500"
              />
              <Gauge
                label={t('Earnings')}
                value={dna(earnings)}
                percentValue={earningsScore * 100}
                icon="send-out"
                color="orange.500"
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

function Gauge({label, value, percentValue, icon}) {
  return (
    <Stack spacing={0} align="center">
      <Box h={103} pos="relative">
        <GaugeBar percent={percentValue} />
        <Box
          bg="gray.50"
          p="10px"
          borderRadius="lg"
          pos="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
        >
          <Icon name={icon} size={5} color="muted" />
        </Box>
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

function GaugeBar({percent}) {
  const {colors} = useTheme()

  const color =
    // eslint-disable-next-line no-nested-ternary
    percent <= 25 ? 'red' : percent <= 75 ? 'orange' : 'green'

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
        stroke={colors.gray[50]}
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
        stroke={colors[color][500]}
        strokeWidth={4}
        strokeDasharray={dashArray}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={transform}
      />
    </svg>
  )
}
