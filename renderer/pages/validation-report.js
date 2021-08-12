import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {UserInlineCard} from '../screens/profile/components'
import {
  ValidationReportBlockOverview,
  ValidationReportCategoryLabel,
  ValidationReportColumn,
  ValidationReportGauge,
  ValidationReportGaugeIcon,
  ValidationReportStat,
} from '../screens/validation-report/components'
import {useValidationReportSummary} from '../screens/validation-report/hooks'
import {
  FailAlert,
  Page,
  PageTitle,
  SuccessAlert,
} from '../shared/components/components'
import Layout from '../shared/components/layout'
import {Table, TableHeaderCol} from '../shared/components/table'
import {useEpochState} from '../shared/providers/epoch-context'
import {useIdentity} from '../shared/providers/identity-context'
import {toLocaleDna, toPercent} from '../shared/utils/utils'

export default function ValidationReport() {
  const {t, i18n} = useTranslation()

  const {colors} = useTheme()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const {address, state, isValidated} = identity

  const {
    score,
    earnings,
    earningsScore,
    validationReward,
    missedValidationReward,
    invitationReward,
    missedInvitationReward,
    flipReward,
    missedFlipReward,
    flipReportReward,
    missedFlipReportReward,
  } = useValidationReportSummary()

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})
  const rawDna = amount =>
    !amount || Number.isNaN(amount)
      ? '–'
      : amount.toLocaleString(i18n.language, {maximumFractionDigits: 3})

  return (
    <Layout>
      <Page as={Stack} spacing={8}>
        <Flex justify="space-between" align="center" w="full">
          <PageTitle m={0}>
            {t('Epoch #{{epochNumber}} validation report', {
              epochNumber: epoch?.epoch - 1,
            })}
          </PageTitle>
          <CloseButton />
        </Flex>
        <Stack spacing={6} w="full">
          <Box>
            {isValidated ? (
              <SuccessAlert>{t('Successfully validated')}</SuccessAlert>
            ) : (
              <FailAlert>{t('Validation failed')}</FailAlert>
            )}
          </Box>
          <Box py={2}>
            <UserInlineCard address={address} status={state} />
          </Box>
          <Stack isInline spacing={10}>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
                  <ValidationReportGauge
                    label={t('Score')}
                    value={toPercent(score)}
                    percentValue={score * 100}
                    icon={
                      <ValidationReportGaugeIcon
                        icon="timer"
                        bg="brandGray.006"
                      />
                    }
                    color={
                      colors[
                        // eslint-disable-next-line no-nested-ternary
                        score <= 0.75 ? 'red' : isValidated ? 'green' : 'orange'
                      ][500]
                    }
                    placeholderColor={colors.brandGray['005']}
                  />
                </Box>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Short session')}
                      value="100% (5 out of 5)"
                    />
                    <ValidationReportStat
                      label={t('Long session')}
                      value="92% (15 out of 16)"
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Total score')}
                      value={toPercent(score)}
                    />
                  </Flex>
                </Stack>
              </Stack>
            </ValidationReportBlockOverview>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
                  <ValidationReportGauge
                    label={t('Earnings')}
                    value={dna(earnings)}
                    percentValue={earningsScore * 100}
                    icon={
                      <ValidationReportGaugeIcon
                        icon="send-out"
                        bg="brandGray.006"
                      />
                    }
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
                    placeholderColor={colors.brandGray['005']}
                  />
                </Box>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Missed invitation earnings')}
                      value={dna(missedInvitationReward)}
                    />
                    <ValidationReportStat
                      label={t('Missed reporting earnings')}
                      value={dna(missedFlipReportReward)}
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <ValidationReportStat
                      label={t('Missed flip earnings')}
                      value={dna(missedFlipReward)}
                    />
                  </Flex>
                </Stack>
              </Stack>
            </ValidationReportBlockOverview>
          </Stack>
          <Stack spacing={5}>
            <Heading color="brandGray.500" fontSize="lg" fontWeight={500}>
              {t('Earnings summary')}
            </Heading>
            <Table fontWeight={500}>
              <thead>
                <tr>
                  <TableHeaderCol>{t('Category')}</TableHeaderCol>
                  <TableHeaderCol>{t('Earned')}</TableHeaderCol>
                  <TableHeaderCol>{t('Missed reward')}</TableHeaderCol>
                  <TableHeaderCol>
                    {t('How to get maximum reward')}
                  </TableHeaderCol>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Validation')}
                      description={t('Rewards for the successfull validation')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(validationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedValidationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {missedValidationReward ? (
                      t('Attend every validation to get a higher reward')
                    ) : (
                      <Text color="green.500">
                        {t('You are at maximum level')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Flips')}
                      description={t(
                        'Rewards for submitted and qualified flips'
                      )}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(flipReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedFlipReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {missedFlipReward ? (
                      t('Make flips carefully')
                    ) : (
                      <Text color="green.500">
                        {t('You are at maximum level')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Invitations')}
                      description={t('Rewards for invitee validation')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(invitationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedInvitationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {missedFlipReward ? (
                      t(
                        'Invite your friends and help them to pass the first three validations'
                      )
                    ) : (
                      <Text color="green.500">
                        {t('You are at maximum level')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
                <tr>
                  <ValidationReportColumn>
                    <ValidationReportCategoryLabel
                      label={t('Flip reports')}
                      description={t('Rewards for reporting bad flips')}
                    />
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(flipReportReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {rawDna(missedFlipReportReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {missedFlipReportReward ? (
                      t('Report all flips that break the rules')
                    ) : (
                      <Text color="green.500">
                        {t('You are at maximum level')}
                      </Text>
                    )}
                  </ValidationReportColumn>
                </tr>
              </tbody>
            </Table>
          </Stack>
        </Stack>
      </Page>
    </Layout>
  )
}
