import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Icon,
  Skeleton,
  Stack,
  Text,
  useTheme,
} from '@chakra-ui/react'
import router from 'next/router'
import {useTranslation} from 'react-i18next'
import {UserInlineCard} from '../screens/profile/components'
import {
  TableValidationDesc,
  ValidationReportBlockOverview,
  ValidationReportCategoryLabel,
  ValidationReportColumn,
  ValidationReportGauge,
  ValidationReportGaugeBar,
  ValidationReportGaugeBox,
  ValidationReportGaugeIcon,
  ValidationReportGaugeStat,
  ValidationReportGaugeStatLabel,
  ValidationReportGaugeStatValue,
  ValidationReportStat,
} from '../screens/validation-report/components'
import {useValidationReportSummary} from '../screens/validation-report/hooks'
import {ValidationResult} from '../screens/validation-report/types'
import {
  ExternalLink,
  FailAlert,
  Page,
  PageTitle,
  SuccessAlert,
  TextLink,
} from '../shared/components/components'
import {SendOutIcon, TimerIcon} from '../shared/components/icons'
import Layout from '../shared/components/layout'
import {Table, TableHeaderCol} from '../shared/components/table'
import {useEpochState} from '../shared/providers/epoch-context'
import {useIdentity} from '../shared/providers/identity-context'
import {IdentityStatus} from '../shared/types'
import {toLocaleDna, toPercent} from '../shared/utils/utils'

export default function ValidationReport() {
  const {t, i18n} = useTranslation()

  const {colors} = useTheme()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const {address, state, isValidated} = identity

  const {
    prevState,
    lastValidationScore,
    totalScore,
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
    totalMissedReward,
    validationResult,
    stakingReward,
    missedStakingReward,
    candidateReward,
    missedCandidateReward,
    isLoading,
  } = useValidationReportSummary()

  const {
    short: {score: shortScore, ...shortResults},
    long: {score: longScore, ...longResults},
  } = lastValidationScore

  const dna = toLocaleDna(i18n.language, {maximumFractionDigits: 3})

  const maybeDna = amount =>
    !amount || Number.isNaN(amount)
      ? '–'
      : amount.toLocaleString(i18n.language, {maximumFractionDigits: 3})

  const epochNumber = epoch?.epoch

  return (
    <Layout>
      <Page as={Stack} spacing={8}>
        <Flex justify="space-between" align="center" w="full">
          <PageTitle m={0}>
            {t('Epoch #{{epochNumber}} validation report', {epochNumber})}
          </PageTitle>
          <CloseButton onClick={() => router.push('/profile')} />
        </Flex>
        <Stack spacing={6} w="full">
          <Box>
            <Skeleton
              isLoaded={!isLoading}
              colorStart={colors.gray[50]}
              colorEnd={colors.gray[300]}
              alignSelf="start"
            >
              {isValidated ? (
                <SuccessAlert>
                  {validationResult === ValidationResult.Success &&
                    t('Successfully validated')}
                  {validationResult === ValidationResult.Penalty &&
                    t('Validated')}
                </SuccessAlert>
              ) : (
                <FailAlert>{t('Validation failed')}</FailAlert>
              )}
            </Skeleton>
          </Box>
          <Box py={2}>
            <UserInlineCard identity={{address, state}} />
          </Box>
          <Stack isInline spacing={10}>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
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
                          bg={colors.brandGray['005']}
                        />
                      ) : (
                        <ValidationReportGaugeBar
                          value={shortScore || 2}
                          color={colors.red[500]}
                          bg={colors.brandGray['005']}
                        />
                      )}
                      <ValidationReportGaugeIcon icon={<TimerIcon />} />
                    </ValidationReportGaugeBox>
                    <ValidationReportGaugeStat>
                      <Skeleton
                        isLoaded={!isLoading}
                        colorStart={colors.brandGray['005']}
                        colorEnd={colors.gray[300]}
                      >
                        {isValidated ? (
                          <ValidationReportGaugeStatValue>
                            {toPercent(totalScore)}
                          </ValidationReportGaugeStatValue>
                        ) : (
                          <ValidationReportGaugeStatValue color="red.500">
                            {t('Failed')}
                          </ValidationReportGaugeStatValue>
                        )}
                      </Skeleton>
                      <Skeleton
                        isLoaded={!isLoading}
                        colorStart={colors.brandGray['005']}
                        colorEnd={colors.gray[300]}
                      >
                        <ValidationReportGaugeStatLabel>
                          {isValidated && t('Total score')}
                          {validationResult ===
                            ValidationResult.LateSubmission &&
                            t('Late submission')}
                          {validationResult ===
                            ValidationResult.MissedValidation &&
                            t('Missed validation')}
                          {validationResult === ValidationResult.WrongAnswers &&
                            t('Wrong answers')}
                        </ValidationReportGaugeStatLabel>
                      </Skeleton>
                    </ValidationReportGaugeStat>
                  </ValidationReportGauge>
                </Box>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <Skeleton
                      isLoaded={!isLoading}
                      colorStart={colors.brandGray['005']}
                      colorEnd={colors.gray[300]}
                    >
                      <ValidationReportStat
                        label={t('Short session')}
                        value={
                          validationResult === ValidationResult.MissedValidation
                            ? '–'
                            : t('{{score}} ({{point}} out of {{flipsCount}})', {
                                score: toPercent(shortScore),
                                point: shortResults.point,
                                flipsCount: shortResults.flipsCount,
                              })
                        }
                      />
                    </Skeleton>
                  </Flex>
                  <Flex justify="space-between">
                    <Skeleton
                      isLoaded={!isLoading}
                      colorStart={colors.brandGray['005']}
                      colorEnd={colors.gray[300]}
                    >
                      <ValidationReportStat
                        label={t('Long session')}
                        value={
                          validationResult === ValidationResult.MissedValidation
                            ? '–'
                            : t('{{score}} ({{point}} out of {{flipsCount}})', {
                                score: toPercent(longScore),
                                point: longResults.point,
                                flipsCount: longResults.flipsCount,
                              })
                        }
                      />
                    </Skeleton>
                  </Flex>
                </Stack>
              </Stack>
            </ValidationReportBlockOverview>
            <ValidationReportBlockOverview>
              <Stack spacing={45}>
                <Box>
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
                          bg={colors.brandGray['005']}
                        />
                      ) : (
                        <ValidationReportGaugeBar
                          value={2}
                          color={colors.red[500]}
                          bg={colors.brandGray['005']}
                        />
                      )}
                      <ValidationReportGaugeIcon icon={<SendOutIcon />} />
                    </ValidationReportGaugeBox>
                    <ValidationReportGaugeStat>
                      <Skeleton
                        isLoaded={!isLoading}
                        colorStart={colors.brandGray['005']}
                        colorEnd={colors.gray[300]}
                      >
                        {validationResult === ValidationResult.Success ? (
                          <ValidationReportGaugeStatValue>
                            {dna(earnings)}
                          </ValidationReportGaugeStatValue>
                        ) : (
                          <ValidationReportGaugeStatValue color="red.500">
                            {dna(totalMissedReward)}
                          </ValidationReportGaugeStatValue>
                        )}
                      </Skeleton>
                      <ValidationReportGaugeStatLabel>
                        {t('Earnings')}
                      </ValidationReportGaugeStatLabel>
                    </ValidationReportGaugeStat>
                  </ValidationReportGauge>
                </Box>
                <Skeleton
                  isLoaded={!isLoading}
                  colorStart={colors.brandGray['005']}
                  colorEnd={colors.gray[300]}
                >
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
                </Skeleton>
              </Stack>
            </ValidationReportBlockOverview>
          </Stack>
          <Stack spacing={5}>
            <Box>
              <Heading color="brandGray.500" fontSize="lg" fontWeight={500}>
                {t('Earnings summary')}
              </Heading>
              <ExternalLink
                href={`https://scan.idena.io/identity/${address}/epoch/${
                  epoch?.epoch
                }/${isValidated ? 'rewards' : 'validation'}`}
              >
                {t('See the full report in blockchain explorer')}
              </ExternalLink>
            </Box>
            <Table fontWeight={500}>
              <thead>
                <tr>
                  <TableHeaderCol>{t('Category')}</TableHeaderCol>
                  <TableHeaderCol>{t('Earned, iDNA')}</TableHeaderCol>
                  <TableHeaderCol>{t('Missed, iDNA')}</TableHeaderCol>
                  <TableHeaderCol style={{width: '260px'}}>
                    {t('How to get maximum reward')}
                  </TableHeaderCol>
                </tr>
              </thead>
              <tbody>
                {stakingReward === 0 && candidateReward === 0 ? (
                  <tr>
                    <ValidationReportColumn>
                      <ValidationReportCategoryLabel
                        isFirst
                        label={t('Validation')}
                        description={t(
                          'Rewards for the successfull validation'
                        )}
                        info={t('Rewards for the successfull validation')}
                      />
                    </ValidationReportColumn>
                    <ValidationReportColumn>
                      <ValidationReportCategoryLabel
                        label={maybeDna(validationReward)}
                        description={t('Earned')}
                      />
                    </ValidationReportColumn>
                    <ValidationReportColumn>
                      <ValidationReportCategoryLabel
                        label={
                          <Text
                            color={missedValidationReward > 0 ? 'red.500' : ''}
                          >
                            {maybeDna(missedValidationReward)}
                          </Text>
                        }
                        description={t('Missed')}
                      />
                    </ValidationReportColumn>
                    <ValidationReportColumn display={['none', 'table-cell']}>
                      <TableValidationDesc
                        t={t}
                        validationResult={validationResult}
                        missedValidationReward={missedValidationReward}
                      />
                    </ValidationReportColumn>
                  </tr>
                ) : (
                  <>
                    <tr>
                      <ValidationReportColumn>
                        <ValidationReportCategoryLabel
                          isFirst
                          label={t('Staking')}
                          description={t('Quadratic staking rewards')}
                          info={t('Quadratic staking rewards')}
                        />
                      </ValidationReportColumn>
                      <ValidationReportColumn>
                        <ValidationReportCategoryLabel
                          label={maybeDna(stakingReward)}
                          description={t('Earned')}
                        />
                      </ValidationReportColumn>
                      <ValidationReportColumn>
                        <ValidationReportCategoryLabel
                          label={
                            <Text
                              color={missedStakingReward > 0 ? 'red.500' : ''}
                            >
                              {maybeDna(missedStakingReward)}
                            </Text>
                          }
                          description={t('Missed')}
                        />
                      </ValidationReportColumn>
                      <ValidationReportColumn display={['none', 'table-cell']}>
                        <TextLink href="/profile?replenishStake">
                          {t('Add stake')}
                          <Icon
                            name="chevron-down"
                            transform="rotate(-90deg)"
                          />
                        </TextLink>
                      </ValidationReportColumn>
                    </tr>
                    {state === IdentityStatus.Newbie &&
                      prevState === IdentityStatus.Candidate && (
                        <tr>
                          <ValidationReportColumn>
                            <ValidationReportCategoryLabel
                              isFirst
                              label={t('Validation')}
                              description={t(
                                'Rewards for the 1st successful validation'
                              )}
                              info={t(
                                'Rewards for the 1st successful validation'
                              )}
                            />
                          </ValidationReportColumn>
                          <ValidationReportColumn>
                            <ValidationReportCategoryLabel
                              label={maybeDna(candidateReward)}
                              description={t('Earned')}
                            />
                          </ValidationReportColumn>
                          <ValidationReportColumn>
                            <ValidationReportCategoryLabel
                              label={
                                <Text
                                  color={
                                    missedCandidateReward > 0 ? 'red.500' : ''
                                  }
                                >
                                  {maybeDna(missedCandidateReward)}
                                </Text>
                              }
                              description={t('Missed')}
                            />
                          </ValidationReportColumn>
                          <ValidationReportColumn
                            display={['none', 'table-cell']}
                          >
                            <TableValidationDesc
                              t={t}
                              validationResult={validationResult}
                              missedValidationReward={missedCandidateReward}
                            />
                          </ValidationReportColumn>
                        </tr>
                      )}
                  </>
                )}
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
                    {maybeDna(flipReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    <Text color={missedFlipReward > 0 ? 'red.500' : ''}>
                      {maybeDna(missedFlipReward)}
                    </Text>
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationResult === ValidationResult.Penalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported.')}
                      </Text>
                    ) : // eslint-disable-next-line no-nested-ternary
                    missedFlipReward > 0 ? (
                      <Text color="red.500">
                        {t('Make all flips carefully')}
                      </Text>
                    ) : flipReward ? (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    ) : (
                      '–'
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
                    {maybeDna(invitationReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    <Text color={missedInvitationReward > 0 ? 'red.500' : ''}>
                      {maybeDna(missedInvitationReward)}
                    </Text>
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationResult === ValidationResult.Penalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported.')}
                      </Text>
                    ) : // eslint-disable-next-line no-nested-ternary
                    missedInvitationReward > 0 ? (
                      <Text color="red.500">
                        {t(
                          'Invite your friends and help them to pass the first 3 validations'
                        )}
                      </Text>
                    ) : invitationReward ? (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    ) : (
                      '–'
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
                    {maybeDna(flipReportReward)}
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    <Text color={missedFlipReportReward > 0 ? 'red.500' : ''}>
                      {maybeDna(missedFlipReportReward)}
                    </Text>
                  </ValidationReportColumn>
                  <ValidationReportColumn>
                    {/* eslint-disable-next-line no-nested-ternary */}
                    {validationResult === ValidationResult.Penalty ? (
                      <Text color="red.500">
                        {t('Your flips were reported.')}
                      </Text>
                    ) : // eslint-disable-next-line no-nested-ternary
                    missedFlipReportReward > 0 ? (
                      <Text color="red.500">
                        {t('Report all flips that break the rules')}
                      </Text>
                    ) : flipReportReward ? (
                      <Text color="green.500">
                        {t('Great job! You have earned maximum reward')}
                      </Text>
                    ) : (
                      t('Report all flips that break the rules')
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
