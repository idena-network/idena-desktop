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
  CloseButton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import dayjs from 'dayjs'
import {Page} from '../../screens/app/components'
import {
  Avatar,
  ExternalLink,
  FloatDebug,
  GoogleTranslateButton,
  Toast,
} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {eitherState, toLocaleDna, toPercent} from '../../shared/utils/utils'
import {
  SmallText,
  VotingBadge,
  VotingOption,
  VotingSkeleton,
} from '../../screens/oracles/components'
import {
  AddFundDrawer,
  VotingStatusBadge,
  VoteDrawer,
  AsideStat,
  VotingInspector,
  VotingResult,
  LaunchDrawer,
  ProlongateDrawer,
} from '../../screens/oracles/containers'
import {createViewVotingMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VotingStatus} from '../../shared/types'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  areSameCaseInsensitive,
  hasQuorum,
  hasWinner,
  minOracleReward,
  oracleReward,
  quorumVotesCount,
  votingFinishDate,
  votingMinBalance,
  winnerVotesCount,
} from '../../screens/oracles/utils'
import {
  Table,
  TableCol,
  TableHeaderCol,
  TableRow,
} from '../../shared/components'
import {
  ContractTransactionType,
  ContractCallMethod,
} from '../../screens/oracles/types'

export default function ViewVotingPage() {
  const {t, i18n} = useTranslation()

  const toast = useToast()

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

  const identity = useIdentityState()

  const viewMachine = React.useMemo(
    () => createViewVotingMachine(id, epoch, identity.address),
    [epoch, id, identity.address]
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
    balance: contractBalance = 0,
    votingMinPayment = 0,
    startDate,
    createDate,
    votingDuration = 0,
    publicVotingDuration = 0,
    quorum = 20,
    committeeSize,
    options = [],
    votes = [],
    voteProofsCount,
    votesCount,
    actualVotesCount = votesCount || voteProofsCount,
    finishDate = votingFinishDate({
      startDate,
      votingDuration,
      publicVotingDuration: 0,
    }),
    finishCountingDate = votingFinishDate({
      startDate,
      votingDuration,
      publicVotingDuration,
    }),
    selectedOption,
    winnerThreshold = 50,
    balanceUpdates,
    ownerFee,
    totalReward,
    committeeEpoch,
    feePerGas,
    oracleReward: assignedOracleReward = minOracleReward(feePerGas),
  } = current.context

  const isLoaded = !current.matches('loading')

  const sameString = a => b => areSameCaseInsensitive(a, b)

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase())) ||
    states.some(sameString(status))

  const isClosed = eitherIdleState(
    VotingStatus.Archived,
    VotingStatus.Terminated
  )

  const reward = oracleReward({
    balance: contractBalance,
    votesCount: actualVotesCount,
    quorum,
    committeeSize,
    ownerFee,
  })

  const didReachQuorum = hasQuorum({votes, quorum, committeeSize})
  const canFinish = dayjs().isAfter(dayjs(finishDate)) && didReachQuorum

  const canProlongate =
    eitherIdleState(VotingStatus.Counting) &&
    !didReachQuorum &&
    (dayjs().isAfter(finishCountingDate) || committeeEpoch !== epoch)

  return (
    <>
      <Page pt={8}>
        <VotingSkeleton isLoaded={isLoaded}>
          <Stack isInline spacing={2} align="center" mb={10}>
            <VotingStatusBadge status={status} fontSize="md">
              {t(status)}
            </VotingStatusBadge>
            <VotingBadge bg="gray.300" color="muted" fontSize="md" pl="1/2">
              <Stack isInline spacing={1} align="center">
                <Avatar w={5} h={5} address={contractHash} />
                <Text>{contractHash}</Text>
              </Stack>
            </VotingBadge>
            <CloseButton ml="auto" onClick={() => redirect('/oracles/list')} />
          </Stack>
        </VotingSkeleton>
        <Stack isInline spacing={10} w="full">
          <Box minWidth="lg" maxW="lg">
            <Stack spacing={6}>
              <VotingSkeleton isLoaded={isLoaded}>
                <Stack
                  spacing={8}
                  borderRadius="md"
                  bg="gray.50"
                  py={8}
                  px={10}
                >
                  <Stack spacing={4}>
                    <Heading fontSize={rem(21)} fontWeight={500}>
                      {title}
                    </Heading>
                    <Text lineHeight="tall">{desc}</Text>
                  </Stack>
                  <GoogleTranslateButton
                    phrases={[
                      title,
                      desc,
                      options.map(({value}) => value).join('\n'),
                    ]}
                    alignSelf="start"
                  />
                </Stack>
              </VotingSkeleton>

              {eitherIdleState(VotingStatus.Open, VotingStatus.Voted) && (
                <VotingSkeleton isLoaded={isLoaded}>
                  <Box>
                    <Text color="muted" fontSize="sm" mb={3}>
                      {t('Choose an option to vote')}
                    </Text>
                    <RadioGroup
                      value={String(selectedOption)}
                      onChange={e => {
                        send('SELECT_OPTION', {
                          option: Number(e.target.value),
                        })
                      }}
                    >
                      {/* eslint-disable-next-line no-shadow */}
                      {options.map(({id, value}) => (
                        <VotingOption
                          key={id}
                          value={String(id)}
                          isDisabled={eitherIdleState(VotingStatus.Voted)}
                          annotation={t('{{count}} min. votes required', {
                            count: toPercent(winnerThreshold / 100),
                          })}
                        >
                          {value}
                        </VotingOption>
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
                  <Stack spacing={3}>
                    <Text color="muted" fontSize="sm">
                      {t('Results')}
                    </Text>
                    {actualVotesCount ? (
                      <VotingResult spacing={3} {...current.context} />
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
                        loadingText={t('Launching')}
                        onClick={() => {
                          send('REVIEW_START_VOTING', {from: identity.address})
                        }}
                      >
                        {t('Launch')}
                      </PrimaryButton>
                    )}
                    {eitherIdleState(VotingStatus.Open) && (
                      <PrimaryButton onClick={() => send('REVIEW')}>
                        {t('Vote')}
                      </PrimaryButton>
                    )}
                    {eitherIdleState(VotingStatus.Counting) && canFinish && (
                      <PrimaryButton
                        isLoading={current.matches(
                          `mining.${VotingStatus.Finishing}`
                        )}
                        loadingText={t('Finishing')}
                        onClick={() =>
                          send('FINISH_VOTING', {from: identity.address})
                        }
                      >
                        {t('Finish voting')}
                      </PrimaryButton>
                    )}
                    {canProlongate && (
                      <PrimaryButton
                        onClick={() => send('REVIEW_PROLONGATE_VOTING')}
                      >
                        {t('Prolongate voting')}
                      </PrimaryButton>
                    )}
                    <SecondaryButton onClick={() => redirect('/oracles/list')}>
                      {t('Close')}
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
                        name={
                          hasWinner({
                            votes,
                            winnerThreshold,
                            quorum,
                            committeeSize,
                          })
                            ? 'user-tick'
                            : 'user'
                        }
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

              <VotingSkeleton isLoaded={isLoaded}>
                <Stack spacing={5}>
                  <Box>
                    <Text fontWeight={500}>{t('Recent transactions')}</Text>
                    <ExternalLink
                      href={`https://scan.idena.io/address/${identity.address}/contract/${id}/balanceUpdates`}
                    >
                      {t('See all transactions updates in Explorer')}
                    </ExternalLink>
                  </Box>
                  <Table style={{tableLayout: 'fixed', fontWeight: 500}}>
                    <thead>
                      <TableRow>
                        <TableHeaderCol>{t('Transaction')}</TableHeaderCol>
                        <TableHeaderCol>{t('Date and time')}</TableHeaderCol>
                        <TableHeaderCol>{t('iDNA value')}</TableHeaderCol>
                      </TableRow>
                    </thead>
                    <tbody>
                      {balanceUpdates.map(
                        ({
                          hash,
                          type,
                          timestamp,
                          from,
                          amount,
                          fee,
                          tips,
                          balanceChange = 0,
                          contractCallMethod,
                        }) => {
                          const isSender = areSameCaseInsensitive(
                            from,
                            identity.address
                          )

                          const txCost =
                            (isSender ? 0 : -amount) + balanceChange
                          const totalTxCost = txCost - (fee + tips)

                          const isCredit = totalTxCost > 0

                          const color =
                            // eslint-disable-next-line no-nested-ternary
                            totalTxCost === 0
                              ? 'brandGray.500'
                              : isCredit
                              ? 'blue.500'
                              : 'red.500'

                          return (
                            <TableRow key={hash}>
                              <TableCol>
                                <Stack isInline>
                                  <Flex
                                    align="center"
                                    justify="center"
                                    bg={isCredit ? 'blue.012' : 'red.012'}
                                    color={color}
                                    borderRadius="lg"
                                    minH={8}
                                    minW={8}
                                  >
                                    <Icon
                                      name={`arrow-${isSender ? 'up' : 'down'}`}
                                      size={5}
                                    />
                                  </Flex>
                                  <Box isTruncated>
                                    {contractCallMethod ? (
                                      <Text>
                                        {ContractCallMethod[contractCallMethod]}
                                      </Text>
                                    ) : (
                                      <Text>
                                        {ContractTransactionType[type]}
                                      </Text>
                                    )}
                                    <SmallText isTruncated title={from}>
                                      {hash}
                                    </SmallText>
                                  </Box>
                                </Stack>
                              </TableCol>
                              <TableCol>
                                <Text>
                                  {new Date(timestamp).toLocaleString()}
                                </Text>
                              </TableCol>
                              <TableCol>
                                <Text color={color} overflowWrap="break-word">
                                  {toLocaleDna(i18n.language, {
                                    signDisplay: 'exceptZero',
                                  })(txCost)}
                                </Text>
                                {isSender && (
                                  <SmallText>
                                    {t('Fee')} {toDna(fee + tips)}
                                  </SmallText>
                                )}
                              </TableCol>
                            </TableRow>
                          )
                        }
                      )}
                    </tbody>
                  </Table>
                </Stack>
              </VotingSkeleton>
            </Stack>
          </Box>
          <VotingSkeleton isLoaded={isLoaded}>
            <Box mt={3}>
              {!isClosed && (
                <Stat mb={8}>
                  <StatLabel as="div" color="muted" fontSize="md">
                    <Stack isInline spacing={2} align="center">
                      <Icon name="star" size={4} color="white" />
                      <Text fontWeight={500}>{t('Total prize')}</Text>
                    </Stack>
                  </StatLabel>
                  <StatNumber fontSize="base" fontWeight={500}>
                    {toDna(contractBalance)}
                  </StatNumber>
                  <StatHelpText mt={1}>
                    <IconButton2 icon="add-fund" onClick={onOpenAddFund}>
                      {t('Add fund')}
                    </IconButton2>
                  </StatHelpText>
                </Stat>
              )}
              <Stack spacing={6}>
                {!isClosed && (
                  <Stat>
                    <StatLabel color="muted" fontSize="md">
                      {t('Lock to vote')}
                    </StatLabel>
                    <StatNumber fontSize="base" fontWeight={500}>
                      {toDna(votingMinPayment)}
                    </StatNumber>
                    <StatHelpText mt={1} color="muted" fontSize="small">
                      {Number(votingMinPayment) > 0
                        ? t(
                            'Deposit will be refunded if your vote matches the majority'
                          )
                        : t('Free voting')}
                    </StatHelpText>
                  </Stat>
                )}
                {!isClosed && (
                  <AsideStat
                    label={t('Your reward')}
                    value={reward ? toDna(reward) : '--'}
                  />
                )}
                {ownerFee && (
                  <AsideStat
                    label={t('Owner fee')}
                    value={toPercent(ownerFee / 100)}
                  />
                )}
                <AsideStat
                  label={t('Quorum required')}
                  value={t('{{count}} votes', {
                    count: quorumVotesCount({quorum, committeeSize}),
                  })}
                />
                <AsideStat
                  label={t('Winner required')}
                  value={t('{{count}} votes', {
                    count: winnerVotesCount({winnerThreshold, committeeSize}),
                  })}
                />
                <AsideStat
                  label={t('Created')}
                  value={new Date(createDate).toLocaleString()}
                />
                {!eitherIdleState(VotingStatus.Pending) && (
                  <Stack spacing={6}>
                    <AsideStat
                      label={t('Start voting')}
                      value={new Date(startDate).toLocaleString()}
                    />
                    <AsideStat
                      label={t('End voting')}
                      value={new Date(finishDate).toLocaleString()}
                    />
                    <AsideStat
                      label={t('End counting')}
                      value={new Date(finishCountingDate).toLocaleString()}
                    />
                  </Stack>
                )}
                {isClosed && (
                  <AsideStat
                    label={t('Prize paid')}
                    value={toDna(totalReward)}
                  />
                )}
              </Stack>
            </Box>
          </VotingSkeleton>
        </Stack>
      </Page>

      <VoteDrawer
        isOpen={eitherState(current, 'review', `mining.${VotingStatus.Voting}`)}
        onClose={() => {
          send('CANCEL')
        }}
        // eslint-disable-next-line no-shadow
        option={options.find(({id}) => id === selectedOption)?.value}
        from={identity.address}
        to={contractHash}
        deposit={votingMinPayment}
        isLoading={current.matches(`mining.${VotingStatus.Voting}`)}
        onVote={() => {
          send('VOTE', {from: identity.address})
        }}
      />

      <AddFundDrawer
        isOpen={isOpenAddFund}
        onClose={onCloseAddFund}
        from={issuer}
        to={contractHash}
        available={identity.balance}
        onAddFund={({amount, from}) => {
          send('ADD_FUND', {amount, from})
          onCloseAddFund()
        }}
      />

      <LaunchDrawer
        isOpen={eitherState(
          current,
          `idle.${VotingStatus.Pending}.review`,
          `mining.${VotingStatus.Starting}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        balance={contractBalance}
        requiredBalance={votingMinBalance({
          oracleReward: assignedOracleReward,
          committeeSize,
          feePerGas,
        })}
        from={identity.address}
        available={identity.balance}
        onLaunch={e => {
          send('START_VOTING', e)
        }}
      />

      <ProlongateDrawer
        isOpen={eitherState(
          current,
          `idle.${VotingStatus.Counting}.review`,
          `mining.${VotingStatus.Prolongating}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        from={identity.address}
        available={identity.balance}
        onProlongate={({from}) => {
          send('PROLONGATE_VOTING', {from})
        }}
      />

      <FloatDebug>{current.value}</FloatDebug>

      {global.isDev && (
        <Box position="absolute" bottom={6} right={6}>
          <VotingInspector
            onTerminate={() => {
              send('TERMINATE_CONTRACT')
            }}
            {...current.context}
          />
        </Box>
      )}
    </>
  )
}
