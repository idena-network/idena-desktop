import React from 'react'
import {
  Stack,
  Box,
  Text,
  Heading,
  RadioGroup,
  Flex,
  Divider,
  Icon,
  Stat,
  StatNumber,
  StatLabel,
  useDisclosure,
  StatHelpText,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import dayjs from 'dayjs'
import {Page} from '../../screens/app/components'
import {Avatar, FloatDebug, Toast} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {eitherState, toLocaleDna, toPercent} from '../../shared/utils/utils'
import {
  VotingBadge,
  VotingOption,
  VotingResultBar,
  VotingSkeleton,
} from '../../screens/oracles/components'
import {
  AddFundDrawer,
  VotingStatusBadge,
  VoteDrawer,
  AsideStat,
  VotingInspector,
} from '../../screens/oracles/containers'
import {createViewVotingMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VotingStatus} from '../../shared/types'
import {useIdentityState} from '../../shared/providers/identity-context'
import {areSameCaseInsensitive} from '../../screens/oracles/utils'

export default function ViewVotingPage() {
  const {t, i18n} = useTranslation()

  const toast = useToast()

  const {
    isOpen: isOpenVote,
    onOpen: onOpenVote,
    onClose: onCloseVote,
  } = useDisclosure()

  const {
    isOpen: isOpenAddFund,
    onOpen: onOpenAddFund,
    onClose: onCloseAddFund,
  } = useDisclosure()

  const {
    query: {id},
    push: redirect,
  } = useRouter()

  const {epoch} = useEpochState()

  const {address, balance} = useIdentityState()

  const viewMachine = React.useMemo(
    () => createViewVotingMachine(id, epoch, address),
    [address, epoch, id]
  )

  const [current, send] = useMachine(viewMachine, {
    actions: {
      onError: (_, {data: {message}}) => {
        toast({
          status: 'error',
          // eslint-disable-next-line react/display-name
          render: () => <Toast title={message} status="error" />,
        })
      },
    },
  })

  const toDna = toLocaleDna(i18n.language)

  const {
    title,
    desc,
    contractHash,
    issuer,
    status,
    fundingAmount = 0,
    votingMinPayment = 0,
    startDate,
    votingDuration = 0,
    publicVotingDuration = 0,
    quorum = 20,
    committeeSize = 100,
    options = [],
    voteProofsCount,
    votesCount,
    actualVotesCount = votesCount || voteProofsCount,
    finishDate = dayjs(startDate)
      .add(votingDuration, 's')
      .add(publicVotingDuration, 's'),
    prevStatus,
    votes = [],
    selectedOption,
  } = current.context

  const isLoaded = !current.matches('loading')

  const isMining = current.matches('mining')
  const isMiningFunding = current.matches('mining.funding')

  const sameString = a => b => areSameCaseInsensitive(a, b)

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase())) ||
    states.some(sameString(status)) ||
    (isMining && states.some(sameString(prevStatus)))

  const maxCount = Math.max(...votes.map(({count}) => count))

  const isLate = dayjs().isAfter(dayjs(finishDate))

  return (
    <>
      <Page pt={8}>
        <Stack isInline spacing={10} w="full">
          <Box minWidth="lg" maxW="lg">
            <VotingSkeleton isLoaded={isLoaded}>
              <Stack isInline spacing={2} mb={10}>
                <VotingStatusBadge status={status}>
                  {t(status)}
                </VotingStatusBadge>
                <VotingBadge bg="gray.300" color="muted" pl="1/2">
                  <Stack isInline spacing={1} align="center">
                    <Avatar w={5} h={5} address={issuer} />
                    <Text>{issuer}</Text>
                  </Stack>
                </VotingBadge>
              </Stack>
            </VotingSkeleton>
            <Stack spacing={6}>
              <VotingSkeleton isLoaded={isLoaded}>
                <Stack
                  spacing={4}
                  borderRadius="md"
                  bg="gray.50"
                  py={8}
                  px={10}
                >
                  <Heading fontSize={rem(21)} fontWeight={500}>
                    {title}
                  </Heading>
                  <Text lineHeight="tall">{desc}</Text>
                </Stack>
              </VotingSkeleton>

              {eitherIdleState(VotingStatus.Open, VotingStatus.Voted) && (
                <VotingSkeleton isLoaded={isLoaded}>
                  <Box>
                    <Text color="muted" fontSize="sm" mb={3}>
                      {t('Choose an option to vote')}
                    </Text>
                    <RadioGroup
                      defaultValue={options[selectedOption]}
                      onChange={e => {
                        send('SELECT_OPTION', {
                          option: e.target.value,
                        })
                        onOpenVote()
                      }}
                    >
                      {options.map((option, idx) => (
                        <VotingOption
                          key={`${option}-${idx}`}
                          value={option}
                          isDisabled={eitherIdleState(VotingStatus.Voted)}
                          annotation={t('{{count}} min. votes required', {
                            count: toPercent(quorum / committeeSize),
                          })}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                </VotingSkeleton>
              )}

              {eitherIdleState(
                VotingStatus.Counting,
                VotingStatus.Archived
              ) && (
                <VotingSkeleton isLoaded={isLoaded}>
                  <Stack spacing={2} mb={6}>
                    <Text color="muted" fontSize="sm">
                      {t('Results')}
                    </Text>
                    {actualVotesCount ? (
                      options.map((option, idx) => {
                        const value =
                          votes.find(v => v.option === idx)?.count ?? 0
                        return (
                          <VotingResultBar
                            label={option}
                            value={value / actualVotesCount}
                            isMax={maxCount === value}
                          />
                        )
                      })
                    ) : (
                      <Text
                        bg="gray.50"
                        borderRadius="md"
                        p={2}
                        color="muted"
                        fontSize="sm"
                      >
                        {t('No votes')}
                      </Text>
                    )}
                  </Stack>
                </VotingSkeleton>
              )}

              <VotingSkeleton isLoaded={isLoaded}>
                <Flex justify="space-between" align="center">
                  <Stack isInline spacing={2}>
                    {eitherIdleState(VotingStatus.Pending) && (
                      <PrimaryButton
                        isLoading={isMining}
                        loadingText={
                          isMiningFunding ? t('Mining') : t('Launching')
                        }
                        onClick={() => {
                          send('START_VOTING', {from: address})
                        }}
                      >
                        {t('Launch')}
                      </PrimaryButton>
                    )}
                    {eitherIdleState(VotingStatus.Open) && (
                      <PrimaryButton
                        isLoading={isMining}
                        loadingText={
                          isMiningFunding ? t('Mining') : t('Voting')
                        }
                        onClick={() => send('VOTE', {from: address})}
                      >
                        {t('Vote')}
                      </PrimaryButton>
                    )}
                    {eitherIdleState(VotingStatus.Counting) && isLate && (
                      <PrimaryButton
                        isLoading={isMining}
                        loadingText={
                          isMiningFunding ? t('Mining') : t('Finishing')
                        }
                        onClick={() => send('FINISH_VOTING', {from: address})}
                      >
                        {t('Finish voting')}
                      </PrimaryButton>
                    )}
                    <SecondaryButton onClick={() => redirect('/oracles/list')}>
                      {t('Cancel')}
                    </SecondaryButton>
                  </Stack>
                  <Stack isInline spacing={3}>
                    <Divider
                      orientation="vertical"
                      borderColor="gray.300"
                      borderLeft="1px"
                    />
                    <Stack isInline spacing={2} align="center">
                      <Icon
                        name={actualVotesCount >= quorum ? 'user-tick' : 'user'}
                        color="muted"
                        w={4}
                        h={4}
                      />
                      <Text as="span">
                        {t('{{count}} votes', {count: actualVotesCount})}
                      </Text>
                    </Stack>
                  </Stack>
                </Flex>
              </VotingSkeleton>
            </Stack>
          </Box>
          <VotingSkeleton isLoaded={isLoaded} mt={isLoaded ? 0 : 16}>
            <Box mt={20}>
              <Stat mb={8}>
                <StatLabel as="div" color="muted" fontSize="md">
                  <Stack isInline spacing={2} align="center">
                    <Icon name="star" size={4} color="white" />
                    <Text fontWeight={500}>{t('Total prize')}</Text>
                  </Stack>
                </StatLabel>
                <StatNumber fontSize={rem(16)} fontWeight={500}>
                  {toDna(fundingAmount)}
                </StatNumber>
                <StatHelpText mt={1}>
                  <IconButton2 icon="add-fund" onClick={onOpenAddFund}>
                    {t('Add fund')}
                  </IconButton2>
                </StatHelpText>
              </Stat>
              <Stack spacing={6}>
                <AsideStat
                  label={t('Deposit')}
                  value={toDna(votingMinPayment)}
                />
                <AsideStat
                  label={t('Your reward')}
                  value={
                    Number.isFinite(fundingAmount) &&
                    Number.isFinite(actualVotesCount)
                      ? toDna(fundingAmount / actualVotesCount)
                      : '--'
                  }
                />
                <AsideStat
                  label={t('Quorum required')}
                  value={t('{{count}} votes', {count: quorum})}
                />
                <AsideStat
                  label={t('Deadline')}
                  value={new Date(finishDate).toLocaleString()}
                />
              </Stack>
            </Box>
          </VotingSkeleton>
        </Stack>
      </Page>

      <VoteDrawer
        isOpen={isOpenVote}
        onClose={onCloseVote}
        option={options[selectedOption]}
        from={address}
        to={contractHash}
        deposit={votingMinPayment}
        onVote={() => {
          send('VOTE', {from: address})
          onCloseVote()
        }}
      />

      <AddFundDrawer
        isOpen={isOpenAddFund}
        onClose={onCloseAddFund}
        from={issuer}
        to={contractHash}
        available={balance}
        onAddFund={({amount, from}) => {
          send('ADD_FUND', {amount, from})
          onCloseAddFund()
        }}
      />

      <FloatDebug>{current.value}</FloatDebug>

      {global.isDev && (
        <Box position="absolute" top={6} right={6}>
          <VotingInspector {...current.context} />
        </Box>
      )}
    </>
  )
}
