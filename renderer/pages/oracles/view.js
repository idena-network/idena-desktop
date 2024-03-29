/* eslint-disable no-nested-ternary */
import React from 'react'
import {
  Stack,
  Box,
  Text,
  Heading,
  RadioGroup,
  Flex,
  Stat,
  StatNumber,
  StatLabel,
  useToast,
  CloseButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import {useQuery} from 'react-query'
import {
  Avatar,
  FloatDebug,
  GoogleTranslateButton,
  Toast,
  Tooltip,
  HDivider,
  VDivider,
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogBody,
  SmallText,
  Page,
} from '../../shared/components/components'
import {
  PrimaryButton,
  IconButton2,
  SecondaryButton,
} from '../../shared/components/button'
import {eitherState, toLocaleDna, toPercent} from '../../shared/utils/utils'
import {
  FillCenter,
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
  ProlongDrawer,
  VotingPhase,
  TerminateDrawer,
  FinishDrawer,
  Linkify,
  MaliciousAdOverlay,
  OracleAdDescription,
} from '../../screens/oracles/containers'
import {createViewVotingMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VotingStatus} from '../../shared/types'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  areSameCaseInsensitive,
  hasQuorum,
  hasWinner,
  humanError,
  mapVotingStatus,
  quorumVotesCount,
  sumAccountableVotes,
} from '../../screens/oracles/utils'
import {
  Table,
  TableCol,
  TableHeaderCol,
  TableRow,
} from '../../shared/components/table'
import {
  ContractTransactionType,
  ContractCallMethod,
} from '../../screens/oracles/types'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {useOracleActions} from '../../screens/oracles/hooks'
import {
  AddFundIcon,
  AdsIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CoinsLgIcon,
  EyeIcon,
  OkIcon,
  RefreshIcon,
  StarIcon,
  UserIcon,
  UserTickIcon,
} from '../../shared/components/icons'
import {useIpfsAd} from '../../screens/ads/hooks'
import {AdPreview, CreateCampaignDrawer} from '../../screens/ads/containers'
import {
  getAdVoting,
  isApprovedVoting,
  validateAdVoting,
} from '../../screens/ads/utils'
import {useSuccessToast} from '../../shared/hooks/use-toast'
import {AdStatus} from '../../screens/ads/types'
import {useFormatDna} from '../../shared/hooks/hooks'

dayjs.extend(relativeTime)
dayjs.extend(duration)

export default function ViewVotingPage() {
  const {t, i18n} = useTranslation()

  const toast = useToast()

  const {
    query: {id},
    push: redirect,
  } = useRouter()

  const {syncing, offline} = useChainState()
  const {epoch} = useEpochState() ?? {epoch: -1}
  const identity = useIdentityState()

  const viewMachine = React.useMemo(
    () => createViewVotingMachine(id, epoch, identity.address),
    [epoch, id, identity.address]
  )

  const [current, send, service] = useMachine(viewMachine, {
    actions: {
      onError: (context, {data: {message}}) => {
        toast({
          status: 'error',
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={humanError(message, context)} status="error" />
          ),
        })
      },
    },
  })

  React.useEffect(() => {
    send('RELOAD', {id, epoch, address: identity.address})
  }, [epoch, id, identity.address, send])

  const [
    {canProlong, canFinish, canTerminate, isFetching: actionsIsFetching},
    refetchActions,
  ] = useOracleActions(id)

  const formatDna = useFormatDna()

  const formatPrizePool = useFormatDna({
    maximumFractionDigits: 4,
  })

  const {
    title,
    desc,
    contractHash,
    status,
    balance = 0,
    contractBalance = Number(balance),
    votingMinPayment = 0,
    publicVotingDuration = 0,
    quorum = 20,
    committeeSize,
    options = [],
    votes = [],
    voteProofsCount,
    finishDate,
    finishCountingDate,
    selectedOption,
    winnerThreshold = 50,
    balanceUpdates,
    ownerFee,
    totalReward,
    estimatedOracleReward,
    estimatedMaxOracleReward = estimatedOracleReward,
    isOracle,
    ownerDeposit,
    rewardsFund,
    estimatedTotalReward,
    epochWithoutGrowth,
    adCid,
    issuer,
  } = current.context

  const isLoaded = !current.matches('loading')

  const sameString = (a) => (b) => areSameCaseInsensitive(a, b)

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map((s) => `idle.${s}`.toLowerCase())) ||
    states.some(sameString(status))

  const isClosed = eitherIdleState(
    VotingStatus.Archived,
    VotingStatus.Terminated
  )

  const didDetermineWinner = hasWinner({
    votes,
    votesCount: voteProofsCount,
    winnerThreshold,
    quorum,
    committeeSize,
    finishCountingDate,
  })

  const didReachQuorum = hasQuorum({
    votesCount: voteProofsCount,
    quorum,
    committeeSize,
  })

  const isVotingFailed =
    !didReachQuorum && epochWithoutGrowth >= 3 && !canProlong

  const isMaxWinnerThreshold = winnerThreshold === 100

  const accountableVoteCount = sumAccountableVotes(votes)

  const {data: ad} = useIpfsAd(adCid)

  const adPreviewDisclosure = useDisclosure()

  const isMaliciousAdVoting = React.useMemo(() => {
    if (ad) {
      return validateAdVoting({ad, voting: current.context}) === false
    }
  }, [ad, current.context])

  const createCampaignDisclosure = useDisclosure()

  const {data: adVoting} = useQuery({
    queryKey: ['adVoting', contractHash],
    queryFn: () => {
      if (contractHash) {
        return getAdVoting(contractHash)
      }
    },
  })

  const successToast = useSuccessToast()

  const {onClose: onCloseCampaignDisclosure} = createCampaignDisclosure

  const handleCreateCampaign = React.useCallback(() => {
    onCloseCampaignDisclosure()

    successToast({
      title: t('Ad campaign is successfully created'),
      actionContent: t(`View 'Campaigns'`),
      onAction: () => {
        redirect(`/adn/list?filter=${AdStatus.Published}`)
      },
    })
  }, [onCloseCampaignDisclosure, redirect, successToast, t])

  const redirectDisclosure = useDisclosure()
  const [redirectUrl, setRedirectUrl] = React.useState()

  return (
    <>
      <Layout syncing={syncing} offline={offline}>
        <Page pt={8}>
          <Stack spacing={10}>
            <VotingSkeleton isLoaded={isLoaded} h="8">
              <Flex align="center" justify="space-between">
                <Stack isInline spacing={2} align="center">
                  <VotingStatusBadge status={status} fontSize="md">
                    {t(mapVotingStatus(status))}
                  </VotingStatusBadge>
                  <Box
                    as={VotingBadge}
                    bg="gray.300"
                    color="muted"
                    fontSize="md"
                    cursor="pointer"
                    pl="0.5"
                    transition="color 0.2s ease"
                    _hover={{
                      color: 'gray.500',
                    }}
                    onClick={() => {
                      global.openExternal(
                        `https://scan.idena.io/contract/${contractHash}`
                      )
                    }}
                  >
                    <Stack isInline spacing={1} align="center">
                      <Avatar w={5} h={5} address={contractHash} />
                      <Text>{contractHash}</Text>
                    </Stack>
                  </Box>
                </Stack>
                <CloseButton onClick={() => redirect('/oracles/list')} />
              </Flex>
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
                        <Heading fontSize={21} fontWeight={500} noOfLines={2}>
                          {isMaliciousAdVoting
                            ? t('Please reject malicious ad')
                            : title}
                        </Heading>
                        {ad ? (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <>
                            {isMaliciousAdVoting ? (
                              <MaliciousAdOverlay>
                                <OracleAdDescription ad={ad} />
                              </MaliciousAdOverlay>
                            ) : (
                              <OracleAdDescription ad={ad} />
                            )}
                          </>
                        ) : (
                          <Text
                            overflow="hidden"
                            lineHeight="tall"
                            whiteSpace="pre-wrap"
                          >
                            <Linkify
                              onClick={(url) => {
                                setRedirectUrl(url)
                                redirectDisclosure.onOpen()
                              }}
                            >
                              {desc}
                            </Linkify>
                          </Text>
                        )}
                      </Stack>
                      <Flex align="center">
                        {adCid && (
                          <Button
                            variant="ghost"
                            colorScheme="blue"
                            leftIcon={<EyeIcon boxSize={4} />}
                            px="1"
                            _hover={{}}
                            _active={{}}
                            onClick={adPreviewDisclosure.onOpen}
                          >
                            {t('Preview')}
                          </Button>
                        )}
                        <GoogleTranslateButton
                          phrases={[
                            title,
                            encodeURIComponent(desc?.replace(/%/g, '%25')),
                            options.map(({value}) => value).join('\n'),
                          ]}
                          locale={i18n.language}
                          alignSelf="start"
                        />
                        {areSameCaseInsensitive(issuer, identity.address) &&
                          !isMaliciousAdVoting &&
                          isApprovedVoting(adVoting) && (
                            <>
                              <VDivider />
                              <Button
                                variant="ghost"
                                colorScheme="blue"
                                leftIcon={<AdsIcon boxSize="4" />}
                                px="1"
                                _hover={{}}
                                _active={{}}
                                onClick={createCampaignDisclosure.onOpen}
                              >
                                {t('Create campaign')}
                              </Button>
                            </>
                          )}
                      </Flex>
                      <HDivider />
                      {isLoaded && (
                        <VotingPhase
                          canFinish={canFinish}
                          canProlong={canProlong}
                          canTerminate={canTerminate}
                          service={service}
                        />
                      )}
                    </Stack>
                  </VotingSkeleton>

                  {eitherIdleState(
                    VotingStatus.Pending,
                    VotingStatus.Starting,
                    VotingStatus.Open,
                    VotingStatus.Voting,
                    VotingStatus.Voted,
                    VotingStatus.Prolonging,
                    VotingStatus.CanBeProlonged
                  ) && (
                    <VotingSkeleton isLoaded={isLoaded}>
                      <Box>
                        <Text color="muted" fontSize="sm" mb={3}>
                          {t('Choose an option to vote')}
                        </Text>
                        {eitherIdleState(
                          VotingStatus.Voted,
                          VotingStatus.CanBeProlonged
                        ) ? (
                          <Stack spacing={3}>
                            {/* eslint-disable-next-line no-shadow */}
                            {options.map(({id, value}) => {
                              const isMine = id === selectedOption
                              return (
                                <Stack
                                  isInline
                                  spacing={2}
                                  align="center"
                                  bg={isMine ? 'blue.012' : 'gray.50'}
                                  borderRadius="md"
                                  minH={8}
                                  px={3}
                                  py={2}
                                  zIndex={1}
                                >
                                  <Flex
                                    align="center"
                                    justify="center"
                                    bg={
                                      isMine ? 'brandBlue.500' : 'transparent'
                                    }
                                    borderRadius="full"
                                    borderWidth={isMine ? 0 : '4px'}
                                    borderColor="gray.100"
                                    color="white"
                                    w={4}
                                    h={4}
                                  >
                                    {isMine && <OkIcon boxSize="3" />}
                                  </Flex>

                                  <Text
                                    isTruncated
                                    maxW="sm"
                                    title={value.length > 50 ? value : ''}
                                  >
                                    {value}
                                  </Text>
                                </Stack>
                              )
                            })}
                          </Stack>
                        ) : (
                          <RadioGroup
                            value={String(selectedOption)}
                            onChange={(value) => {
                              send('SELECT_OPTION', {
                                option: Number(value),
                              })
                            }}
                          >
                            <Stack spacing="2">
                              {/* eslint-disable-next-line no-shadow */}
                              {options.map(({id, value}) => (
                                <VotingOption
                                  key={id}
                                  value={String(id)}
                                  isDisabled={eitherIdleState(
                                    VotingStatus.Pending,
                                    VotingStatus.Starting,
                                    VotingStatus.Voted
                                  )}
                                  annotation={
                                    isMaxWinnerThreshold
                                      ? null
                                      : t('{{count}} min. votes required', {
                                          count: toPercent(
                                            winnerThreshold / 100
                                          ),
                                        })
                                  }
                                >
                                  {value}
                                </VotingOption>
                              ))}
                            </Stack>
                          </RadioGroup>
                        )}
                      </Box>
                    </VotingSkeleton>
                  )}

                  {eitherIdleState(
                    VotingStatus.Counting,
                    VotingStatus.Finishing,
                    VotingStatus.Archived,
                    VotingStatus.Terminating,
                    VotingStatus.Terminated
                  ) && (
                    <VotingSkeleton isLoaded={isLoaded}>
                      <Stack spacing={3}>
                        <Text color="muted" fontSize="sm">
                          {t('Voting results')}
                        </Text>
                        <VotingResult votingService={service} spacing={3} />
                      </Stack>
                    </VotingSkeleton>
                  )}

                  <VotingSkeleton isLoaded={!actionsIsFetching}>
                    <Flex justify="space-between" align="center">
                      <Stack isInline spacing={2}>
                        {eitherIdleState(VotingStatus.Pending) && (
                          <PrimaryButton
                            loadingText={t('Launching')}
                            onClick={() => {
                              send('REVIEW_START_VOTING', {
                                from: identity.address,
                              })
                            }}
                          >
                            {t('Launch')}
                          </PrimaryButton>
                        )}

                        {eitherIdleState(VotingStatus.Open) &&
                          (isOracle ? (
                            <PrimaryButton onClick={() => send('REVIEW')}>
                              {t('Vote')}
                            </PrimaryButton>
                          ) : (
                            <Box>
                              <Tooltip
                                label={t(
                                  'This vote is not available to you. Only validated identities randomly selected to the committee can vote.'
                                )}
                                placement="top"
                                zIndex="tooltip"
                              >
                                {/* TODO: pretending to be a Box until https://github.com/chakra-ui/chakra-ui/pull/2272 caused by https://github.com/facebook/react/issues/11972 */}
                                <PrimaryButton as={Box} isDisabled>
                                  {t('Vote')}
                                </PrimaryButton>
                              </Tooltip>
                            </Box>
                          ))}

                        {eitherIdleState(
                          VotingStatus.Counting,
                          VotingStatus.CanBeProlonged
                        ) &&
                          canFinish && (
                            <PrimaryButton
                              isLoading={current.matches(
                                `mining.${VotingStatus.Finishing}`
                              )}
                              loadingText={t('Claiming')}
                              onClick={() =>
                                send('REVIEW_FINISH_VOTING', {
                                  from: identity.address,
                                })
                              }
                            >
                              {isVotingFailed
                                ? t('Claim refunds')
                                : t('Claim rewards')}
                            </PrimaryButton>
                          )}

                        {eitherIdleState(
                          VotingStatus.Open,
                          VotingStatus.Voting,
                          VotingStatus.Voted,
                          VotingStatus.Counting,
                          VotingStatus.CanBeProlonged
                        ) &&
                          canProlong && (
                            <PrimaryButton
                              onClick={() => send('REVIEW_PROLONG_VOTING')}
                            >
                              {t('Prolong voting')}
                            </PrimaryButton>
                          )}

                        {(eitherIdleState(
                          VotingStatus.Voted,
                          VotingStatus.Voting
                        ) ||
                          (eitherIdleState(VotingStatus.Counting) &&
                            !canProlong &&
                            !canFinish &&
                            !canTerminate)) && (
                          <PrimaryButton as={Box} isDisabled>
                            {t('Vote')}
                          </PrimaryButton>
                        )}

                        {!eitherIdleState(
                          VotingStatus.Terminated,
                          VotingStatus.Terminating
                        ) &&
                          canTerminate && (
                            <PrimaryButton
                              colorScheme="red"
                              onClick={() => send('TERMINATE')}
                            >
                              {t('Terminate')}
                            </PrimaryButton>
                          )}
                      </Stack>
                      <Stack isInline spacing={3} align="center">
                        {eitherIdleState(
                          VotingStatus.Archived,
                          VotingStatus.Terminated
                        ) &&
                          !didDetermineWinner && (
                            <Text color="red.500">
                              {t('No winner selected')}
                            </Text>
                          )}

                        {eitherIdleState(VotingStatus.CanBeProlonged) &&
                          !didReachQuorum && (
                            <Text color="red.500">
                              {t('Quorum is not reached')}
                            </Text>
                          )}
                        {eitherIdleState(VotingStatus.Counting) &&
                          isVotingFailed && (
                            <Text color="red.500">
                              {t(
                                'No winner selected as the quorum is not reached'
                              )}
                            </Text>
                          )}
                        <VDivider />
                        <Stack isInline spacing={2} align="center">
                          {eitherIdleState(
                            VotingStatus.Archived,
                            VotingStatus.Terminated
                          ) && didDetermineWinner ? (
                            <UserTickIcon boxSize="4" color="muted" />
                          ) : (
                            <UserIcon boxSize="4" color="muted" />
                          )}

                          <Text as="span">
                            {eitherIdleState(VotingStatus.Counting) &&
                            !isVotingFailed ? (
                              <>
                                {t('{{count}} published votes', {
                                  count: accountableVoteCount,
                                })}{' '}
                                {t('out of {{count}}', {
                                  count: voteProofsCount,
                                })}
                              </>
                            ) : eitherIdleState(
                                VotingStatus.Pending,
                                VotingStatus.Open,
                                VotingStatus.Voting,
                                VotingStatus.Voted,
                                VotingStatus.Counting,
                                VotingStatus.CanBeProlonged
                              ) ? (
                              t('{{count}} votes', {
                                count: voteProofsCount,
                              })
                            ) : (
                              t('{{count}} published votes', {
                                count: accountableVoteCount,
                              })
                            )}
                          </Text>
                        </Stack>
                      </Stack>
                    </Flex>
                  </VotingSkeleton>

                  <VotingSkeleton isLoaded={isLoaded}>
                    <Stack spacing={5}>
                      <Box>
                        <Text fontWeight={500}>{t('Recent transactions')}</Text>
                      </Box>
                      <Table style={{tableLayout: 'fixed', fontWeight: 500}}>
                        <thead>
                          <TableRow>
                            <TableHeaderCol>{t('Transaction')}</TableHeaderCol>
                            <TableHeaderCol>
                              {t('Date and time')}
                            </TableHeaderCol>
                            <TableHeaderCol className="text-right">
                              {t('Amount')}
                            </TableHeaderCol>
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
                                (isSender ? -amount : 0) + balanceChange
                              const totalTxCost =
                                txCost - ((isSender ? fee : 0) + tips)

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
                                        {isSender ? (
                                          <ArrowUpIcon boxSize={5} />
                                        ) : (
                                          <ArrowDownIcon boxSize="5" />
                                        )}
                                      </Flex>
                                      <Box isTruncated>
                                        {contractCallMethod ? (
                                          <Text>
                                            {
                                              ContractCallMethod[
                                                contractCallMethod
                                              ]
                                            }
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
                                  <TableCol className="text-right">
                                    <Text
                                      color={color}
                                      overflowWrap="break-word"
                                    >
                                      {toLocaleDna(i18n.language, {
                                        signDisplay: 'exceptZero',
                                      })(txCost)}
                                    </Text>
                                    {isSender && (
                                      <SmallText>
                                        {t('Fee')} {formatDna(fee + tips)}
                                      </SmallText>
                                    )}
                                  </TableCol>
                                </TableRow>
                              )
                            }
                          )}
                          {balanceUpdates.length === 0 && (
                            <tr>
                              <td colSpan={3}>
                                <FillCenter py={12}>
                                  <Stack spacing={4} align="center">
                                    <CoinsLgIcon
                                      boxSize="20"
                                      color="gray.300"
                                    />
                                    <Text color="muted">
                                      {t('No transactions')}
                                    </Text>
                                  </Stack>
                                </FillCenter>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Stack>
                  </VotingSkeleton>
                </Stack>
              </Box>
              <VotingSkeleton isLoaded={isLoaded} h={isLoaded ? 'auto' : 'lg'}>
                <Box mt={3}>
                  <Box mt={-2} mb={4}>
                    <IconButton2
                      icon={<RefreshIcon />}
                      px={1}
                      pr={3}
                      _focus={null}
                      onClick={() => {
                        send('REFRESH')
                        refetchActions()
                      }}
                    >
                      {t('Refresh')}
                    </IconButton2>
                  </Box>
                  {!isClosed && (
                    <Stat mb={8}>
                      <StatLabel as="div" color="muted" fontSize="md">
                        <Stack isInline spacing={2} align="center">
                          <StarIcon boxSize="4" color="white" />
                          <Text fontWeight={500}>{t('Prize pool')}</Text>
                        </Stack>
                      </StatLabel>
                      <StatNumber fontSize="base" fontWeight={500}>
                        {formatPrizePool(estimatedTotalReward)}
                      </StatNumber>
                      <Box mt={1}>
                        <IconButton2
                          icon={<AddFundIcon />}
                          onClick={() => {
                            send({type: 'ADD_FUND'})
                          }}
                        >
                          {t('Add funds')}
                        </IconButton2>
                      </Box>
                    </Stat>
                  )}
                  <Stack spacing={6}>
                    {!isClosed && (
                      <Stat>
                        <StatLabel color="muted" fontSize="md">
                          <Tooltip
                            label={
                              // eslint-disable-next-line no-nested-ternary
                              Number(votingMinPayment) > 0
                                ? isMaxWinnerThreshold
                                  ? t('Deposit will be refunded')
                                  : t(
                                      'Deposit will be refunded if your vote matches the majority'
                                    )
                                : t('Free voting')
                            }
                            placement="top"
                          >
                            <Text
                              as="span"
                              borderBottom="dotted 1px"
                              borderBottomColor="muted"
                              cursor="help"
                            >
                              {t('Voting deposit')}
                            </Text>
                          </Tooltip>
                        </StatLabel>
                        <StatNumber fontSize="base" fontWeight={500}>
                          {formatDna(votingMinPayment)}
                        </StatNumber>
                      </Stat>
                    )}
                    {!isClosed && (
                      <Stat>
                        <StatLabel color="muted" fontSize="md">
                          <Tooltip
                            label={t('Including your Voting deposit')}
                            placement="top"
                          >
                            <Text
                              as="span"
                              borderBottom="dotted 1px"
                              borderBottomColor="muted"
                              cursor="help"
                            >
                              {t('Min reward')}
                            </Text>
                          </Tooltip>
                        </StatLabel>
                        <StatNumber fontSize="base" fontWeight={500}>
                          {formatDna(estimatedOracleReward)}
                        </StatNumber>
                      </Stat>
                    )}
                    {!isClosed && (
                      <Stat>
                        <StatLabel color="muted" fontSize="md">
                          {isMaxWinnerThreshold ? (
                            <Text as="span">{t('Your max reward')}</Text>
                          ) : (
                            <Tooltip
                              label={t(
                                `Including a share of minority voters' deposit`
                              )}
                              placement="top"
                            >
                              <Text
                                as="span"
                                borderBottom="dotted 1px"
                                borderBottomColor="muted"
                                cursor="help"
                              >
                                {t('Max reward')}
                              </Text>
                            </Tooltip>
                          )}
                        </StatLabel>
                        <StatNumber fontSize="base" fontWeight={500}>
                          {formatDna(estimatedMaxOracleReward)}
                        </StatNumber>
                      </Stat>
                    )}
                    <AsideStat
                      label={t('Committee size')}
                      value={t('{{committeeSize}} oracles', {committeeSize})}
                    />
                    <AsideStat
                      label={t('Quorum required')}
                      value={t('{{count}} votes', {
                        count: quorumVotesCount({quorum, committeeSize}),
                      })}
                    />
                    <AsideStat
                      label={t('Majority threshold')}
                      value={
                        isMaxWinnerThreshold
                          ? t('N/A')
                          : toPercent(winnerThreshold / 100)
                      }
                    />
                    {isClosed && (
                      <AsideStat
                        label={t('Prize paid')}
                        value={formatDna(totalReward)}
                      />
                    )}
                  </Stack>
                </Box>
              </VotingSkeleton>
            </Stack>
          </Stack>
        </Page>
      </Layout>

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
        publicVotingDuration={publicVotingDuration}
        finishDate={finishDate}
        finishCountingDate={finishCountingDate}
        isLoading={current.matches(`mining.${VotingStatus.Voting}`)}
        onVote={() => {
          send('VOTE', {from: identity.address})
        }}
      />

      <AddFundDrawer
        isOpen={eitherState(
          current,
          'funding',
          `mining.${VotingStatus.Funding}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        from={identity.address}
        to={contractHash}
        available={identity.balance}
        ownerFee={ownerFee}
        ownerDeposit={Number(ownerDeposit)}
        rewardsFund={Number(rewardsFund)}
        balance={contractBalance}
        isLoading={current.matches(`mining.${VotingStatus.Funding}`)}
        onAddFund={({amount, from}) => {
          send('ADD_FUND', {amount, from})
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
        ownerFee={ownerFee}
        ownerDeposit={Number(ownerDeposit)}
        rewardsFund={Number(rewardsFund)}
        from={identity.address}
        available={identity.balance}
        isLoading={current.matches(`mining.${VotingStatus.Starting}`)}
        onLaunch={(e) => {
          send('START_VOTING', e)
        }}
        onError={(e) => send('ERROR', e)}
      />

      <FinishDrawer
        isOpen={eitherState(
          current,
          `finish`,
          `mining.${VotingStatus.Finishing}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        from={identity.address}
        available={identity.balance}
        isLoading={current.matches(`mining.${VotingStatus.Finishing}`)}
        onFinish={({from}) => {
          send('FINISH', {from})
        }}
        hasWinner={didDetermineWinner}
        isVotingFailed={isVotingFailed}
      />

      <ProlongDrawer
        isOpen={eitherState(
          current,
          'prolong',
          `mining.${VotingStatus.Prolonging}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        from={identity.address}
        available={identity.balance}
        isLoading={current.matches(`mining.${VotingStatus.Prolonging}`)}
        onProlong={({from}) => {
          send('PROLONG_VOTING', {from})
        }}
      />

      <TerminateDrawer
        isOpen={eitherState(
          current,
          `idle.terminating`,
          `mining.${VotingStatus.Terminating}`
        )}
        onClose={() => {
          send('CANCEL')
        }}
        contractAddress={contractHash}
        isLoading={current.matches(`mining.${VotingStatus.Terminating}`)}
        onTerminate={() => {
          send('TERMINATE', {from: identity.address})
        }}
      />

      {adCid && (
        <AdPreview
          ad={{...ad, author: issuer}}
          isMalicious={isMaliciousAdVoting}
          {...adPreviewDisclosure}
        />
      )}

      <Dialog {...redirectDisclosure}>
        <DialogHeader>{t('Leaving Idena')}</DialogHeader>
        <DialogBody>
          <Text>{t(`You're about to leave Idena.`)}</Text>
          <Text>{t(`Are you sure?`)}</Text>
        </DialogBody>
        <DialogFooter>
          <SecondaryButton onClick={redirectDisclosure.onClose}>
            {t('Cancel')}
          </SecondaryButton>
          <PrimaryButton
            onClick={() => {
              global.openExternal(redirectUrl)
              redirectDisclosure.onClose()
            }}
          >
            {t('Continue')}
          </PrimaryButton>
        </DialogFooter>
      </Dialog>

      <CreateCampaignDrawer
        ad={{...ad, cid: adCid, contract: contractHash}}
        onSuccess={handleCreateCampaign}
        {...createCampaignDisclosure}
      />

      {global.isDev && (
        <>
          <FloatDebug>{current.value}</FloatDebug>

          <Box position="absolute" bottom={6} right={6}>
            <VotingInspector
              onTerminate={() => {
                send('TERMINATE')
              }}
              {...current.context}
            />
          </Box>
        </>
      )}
    </>
  )
}
