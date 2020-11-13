/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {useService} from '@xstate/react'
import {
  Box,
  Stack,
  Text,
  Icon,
  Flex,
  Divider,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  Drawer as ChakraDrawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerContent,
  Heading,
  Collapse,
  IconButton,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
} from '@chakra-ui/core'
import dayjs from 'dayjs'
import {toLocaleDna, eitherState, callRpc} from '../../shared/utils/utils'
import {
  Avatar,
  Debug,
  Drawer,
  DrawerBody,
  DrawerHeader,
  Input,
  Tooltip,
} from '../../shared/components/components'
import {VotingStatus} from '../../shared/types'
import {
  VotingResultBar,
  VotingBadge,
  OracleDrawerHeader,
  OracleDrawerBody,
  OracleFormControl,
  OracleFormHelper,
  OracleFormHelperText,
  TaggedInput,
  DnaInput,
} from './components'
import {
  InfoButton,
  PrimaryButton,
  SecondaryButton,
} from '../../shared/components/button'
import {Link} from '../../shared/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  createContractDataReader,
  createContractReadonlyCaller,
  hasWinner,
  humanizeDuration,
  minOracleReward,
  viewVotingHref,
  votingFinishDate,
  votingMinBalance,
  winnerVotesCount,
  isPendingTermination,
} from './utils'

export function VotingCard({votingRef, ...props}) {
  const router = useRouter()

  const {t, i18n} = useTranslation()

  const [current, send] = useService(votingRef)

  const {
    id,
    title,
    desc,
    contractHash,
    status,
    balance = 0,
    startDate,
    votingDuration,
    publicVotingDuration,
    finishDate = votingFinishDate({
      startDate,
      votingDuration,
      publicVotingDuration,
    }),
    votes = [],
    voteProofsCount,
    votesCount,
    actualVotesCount = votesCount || voteProofsCount,
    prevStatus,
    votingMinPayment,
    winnerThreshold,
    quorum,
    committeeSize,
    isOracle,
    totalReward,
  } = current.context

  const toDna = toLocaleDna(i18n.language)

  const viewHref = viewVotingHref(id)

  const isMining = eitherState(current, 'mining')

  const sameString = a => b => a?.toLowerCase() === b?.toLowerCase()

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase())) ||
    states.some(sameString(status)) ||
    (isMining && states.some(sameString(prevStatus)))

  const isClosed = eitherIdleState(
    VotingStatus.Archived,
    VotingStatus.Terminated
  )

  return (
    <Box {...props}>
      <Stack isInline spacing={2} mb={3} align="center">
        <VotingStatusBadge status={status}>{t(status)}</VotingStatusBadge>
        <Link href={viewHref}>
          <VotingBadge align="center" bg="gray.50" color="muted" pl="1/2">
            <Avatar
              address={contractHash}
              bg="white"
              borderColor="brandGray.016"
              borderWidth="1px"
              borderRadius="full"
              w={5}
              h={5}
              mr={1}
            />
            <Text as="span">{contractHash}</Text>
          </VotingBadge>
        </Link>
      </Stack>
      <Link href={viewHref}>
        <Text fontSize="base" fontWeight={500} mb={2}>
          {title}
        </Text>
      </Link>
      <Text color="muted" mb={4}>
        {desc}
      </Text>
      {eitherIdleState(VotingStatus.Archived, VotingStatus.Counting) && (
        <Stack spacing={2} mb={6}>
          <Text color="muted" fontSize="sm">
            {t('Results')}
          </Text>
          {actualVotesCount ? (
            <VotingResult {...current.context} />
          ) : (
            // eslint-disable-next-line no-shadow
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
      )}
      <Stack
        isInline
        spacing={2}
        align="center"
        bg="orange.010"
        borderColor="orange.050"
        borderWidth="1px"
        borderRadius="md"
        py={2}
        px={3}
        mb={6}
      >
        <Icon name="star" size={5} color="white" />
        <Text fontWeight={500}>
          {isClosed ? t('Oracles rewards paid') : t('Total prize')}:{' '}
          {toDna(isClosed ? totalReward : balance)}
        </Text>
        {!isClosed && (
          <Text color="orange.500">
            {Number(votingMinPayment) > 0
              ? t(`Lock {{amount}} for voting`, {
                  amount: toLocaleDna(i18n.language)(votingMinPayment),
                })
              : t('Free voting')}
          </Text>
        )}
      </Stack>
      <Flex justify="space-between" align="center">
        <Stack isInline spacing={2}>
          {eitherIdleState(VotingStatus.Pending) && (
            <PrimaryButton
              isDisabled={isMining}
              loadingText={t('Launching')}
              onClick={() => {
                send('REVIEW_START_VOTING')
              }}
            >
              {t('Launch')}
            </PrimaryButton>
          )}

          {eitherIdleState(VotingStatus.Open) &&
            (isOracle ? (
              <PrimaryButton onClick={() => router.push(viewHref)}>
                {t('Vote')}
              </PrimaryButton>
            ) : (
              <Tooltip
                label={t('This vote is not available to you')}
                placement="top"
              >
                {/* TODO: pretending to be a Box until https://github.com/chakra-ui/chakra-ui/pull/2272 caused by https://github.com/facebook/react/issues/11972 */}
                <PrimaryButton as={Box} isDisabled>
                  {t('Vote')}
                </PrimaryButton>
              </Tooltip>
            ))}
          {eitherIdleState(
            VotingStatus.Voted,
            VotingStatus.Archived,
            VotingStatus.Counting
          ) && (
            <PrimaryButton onClick={() => router.push(viewHref)}>
              {t('Open')}
            </PrimaryButton>
          )}
        </Stack>
        {!eitherIdleState(VotingStatus.Pending) && (
          <Stack isInline spacing={3}>
            <Text>
              <Text as="span" color="muted">
                {t('Deadline')}:
              </Text>{' '}
              <Text as="span">{new Date(finishDate).toLocaleString()}</Text>
            </Text>
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
                    votesCount,
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
        )}
      </Flex>
    </Box>
  )
}

export function VotingStatusBadge({status, ...props}) {
  const colors = (() => {
    switch (status?.toLowerCase()) {
      case VotingStatus.Pending:
        return {
          bg: 'rgb(218 121 255 /0.2)',
          color: 'rgb(218 121 255)',
        }
      case VotingStatus.Open:
        return {
          bg: 'green.020',
          color: 'green.500',
        }
      case VotingStatus.Voted:
        return {
          bg: 'blue.020',
          color: 'blue.500',
        }
      case VotingStatus.Deploying:
      case VotingStatus.Funding:
      case VotingStatus.Starting:
        return {
          bg: 'orange.020',
          color: 'orange.500',
        }
      case VotingStatus.Counting:
        return {
          bg: 'red.020',
          color: 'red.500',
        }
      default:
      case VotingStatus.Archived:
        return {
          bg: 'gray.300',
          color: 'muted',
        }
    }
  })()

  return <VotingBadge {...colors} {...props} />
}

export function AddFundDrawer({from, to, available, onAddFund, ...props}) {
  const {t, i18n} = useTranslation()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Drawer {...props}>
      <OracleDrawerHeader icon="add-fund">{t('Add fund')}</OracleDrawerHeader>
      <Box
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {amountInput, fromInput} = e.target.elements
          onAddFund({amount: Number(amountInput.value), from: fromInput.value})
        }}
      >
        <OracleDrawerBody>
          <OracleFormControl label={t('Transfer from')}>
            <Input name="fromInput" defaultValue={from} />
            <OracleFormHelper label={t('Available')} value={toDna(available)} />
          </OracleFormControl>
          <OracleFormControl label="To address">
            <Input isDisabled value={to} />
          </OracleFormControl>
          <OracleFormControl label={t('Amount')}>
            <DnaInput name="amountInput" />
          </OracleFormControl>
          <PrimaryButton type="submit" mt={3} ml="auto">
            {t('Send')}
          </PrimaryButton>
        </OracleDrawerBody>
      </Box>
    </Drawer>
  )
}

export function VoteDrawer({
  option,
  from,
  to,
  deposit = 0,
  isLoading,
  onVote,
  ...props
}) {
  const {t, i18n} = useTranslation()

  const {balance} = useIdentityState()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="send-out" variantColor="blue">
        {t('Voting: {{option}}', {option, nsSeparator: '!'})}
      </OracleDrawerHeader>
      <OracleDrawerBody>
        <OracleFormControl label={t('Transfer from')}>
          <Input defaultValue={from} />
          <OracleFormHelper label={t('Available')} value={toDna(balance)} />
        </OracleFormControl>
        <OracleFormControl label="To address">
          <Input isDisabled value={to} />
        </OracleFormControl>
        <OracleFormControl label={t('Lock, iDNA')}>
          <Input isDisabled value={deposit} />
        </OracleFormControl>
        <PrimaryButton
          mt={3}
          ml="auto"
          isLoading={isLoading}
          loadingText={t('Publishing')}
          onClick={onVote}
        >
          {t('Send')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function ReviewVotingDrawer({
  from,
  available,
  minBalance,
  minStake,
  isLoading,
  votingDuration,
  publicVotingDuration,
  onConfirm,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Create Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput, balanceInput, stakeInput} = e.target.elements
          onConfirm({
            from: fromInput.value,
            balance: Number(balanceInput.value),
            stake: Number(stakeInput.value),
          })
        }}
      >
        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} isDisabled />
          <OracleFormHelper
            label={t('Available')}
            value={toLocaleDna(i18n.language)(available)}
          />
        </OracleFormControl>
        <OracleFormControl label={t('Rewards')}>
          <DnaInput name="balanceInput" defaultValue={minBalance} isDisabled />
          <OracleFormHelperText>
            {t(
              `Rewards will be paid to Oracles. You’ll be able to increase Oracles' rewards after the voting is created.`
            )}
          </OracleFormHelperText>
        </OracleFormControl>
        <OracleFormControl label={t('Stake')}>
          <DnaInput name="stakeInput" defaultValue={minStake} isDisabled />
          <OracleFormHelperText>
            {t(
              'Voting stake will be refunded to your address once the voting smart contract is terminated'
            )}
          </OracleFormHelperText>
        </OracleFormControl>
        <Box>
          <OracleFormHelper
            label={t('Secret voting')}
            value={t('About {{duration}}', {
              duration: humanizeDuration(votingDuration),
            })}
          />
          <OracleFormHelper
            label={t('Public voting')}
            value={t('About {{duration}}', {
              duration: humanizeDuration(publicVotingDuration),
            })}
          />
        </Box>
        <Box>
          <OracleFormHelper
            label={t('Total amount')}
            value={toLocaleDna(i18n.language)(minBalance + minStake)}
          />
        </Box>
        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Publishing')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Confirm')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function AsideStat({label, value, ...props}) {
  return (
    <Stat {...props}>
      <StatLabel color="muted" fontSize="md">
        {label}
      </StatLabel>
      <StatNumber fontSize="base" fontWeight={500}>
        {value}
      </StatNumber>
    </Stat>
  )
}

export function VotingInspector({onTerminate, ...contract}) {
  const [result, setResult] = React.useState({})

  const {isOpen, onOpen, onClose} = useDisclosure()
  const {isOpen: isOpenContract, onToggle: onToggleContract} = useDisclosure()

  return (
    <>
      <Button
        bg="blue.50"
        rightIcon="info"
        variant="ghost"
        variantColor="blue"
        onClick={onOpen}
      >
        Open inspector
      </Button>
      <ChakraDrawer isOpen={isOpen} size="lg" onClose={onClose}>
        <DrawerOverlay bg="xblack.080" />
        <DrawerContent px={8} py={12} overflowY="auto">
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading fontSize="lg" fontWeight={500} mb={2}>
              Inspector
            </Heading>
          </DrawerHeader>
          <DrawerBody fontSize="md">
            <Stack spacing={4} w="lg">
              <Stack>
                <Flex align="center">
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    Contract
                  </Heading>
                  <IconButton
                    icon="chevron-down"
                    size="sm"
                    fontSize="lg"
                    ml={1}
                    onClick={onToggleContract}
                  />
                </Flex>
                <Collapse isOpen={isOpenContract}>
                  <Debug>{contract}</Debug>
                </Collapse>
                <Box mt={2}>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    readonlyCall
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      const {
                        readonlyCallMethod,
                        readonlyCallMethodFormat,
                        readonlyCallArgs,
                      } = e.target.elements

                      setResult(
                        await createContractReadonlyCaller(contract)(
                          readonlyCallMethod.value,
                          readonlyCallMethodFormat.value,
                          ...JSON.parse(readonlyCallArgs.value || '[]')
                        )
                      )
                    }}
                  >
                    <Stack isInline spacing={2} justify="space-between">
                      <Input
                        id="readonlyCallMethod"
                        placeholder="readonlyCallMethod method"
                      />
                      <Input
                        id="readonlyCallMethodFormat"
                        placeholder="format"
                        w={100}
                      />
                    </Stack>
                    <Input
                      id="readonlyCallArgs"
                      placeholder="readonlyCall args"
                    />
                    <SecondaryButton type="submit" ml="auto">
                      Readonly call
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    readKey
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()

                      const {readKey, readKeyFormat} = e.target.elements

                      setResult(
                        await createContractDataReader(contract)(
                          readKey.value,
                          readKeyFormat.value
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input id="readKey" placeholder="readKey key" />
                      <Input id="readKeyFormat" placeholder="format" w={100} />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Read data
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    txReceipt
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      setResult(
                        await callRpc(
                          'bcn_txReceipt',
                          e.target.elements.txHash.value
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input id="txHash" placeholder="txHash" />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Show receipt
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    contract_getStake
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      setResult(
                        await callRpc(
                          'contract_getStake',
                          contract.contractHash
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input
                        value={contract.contractHash}
                        isReadonly
                        isDisabled
                      />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Get stake
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box ml="auto" mt={6}>
                  <PrimaryButton variantColor="red" onClick={onTerminate}>
                    Terminate contact
                  </PrimaryButton>
                </Box>
              </Stack>
              <Debug>{result}</Debug>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </ChakraDrawer>
    </>
  )
}

export function VotingDurationInput({service, ...props}) {
  const {t} = useTranslation()

  const [, send] = useService(service)

  return (
    <TaggedInput
      type="number"
      min={1}
      helperText={t('About {{duration}}', {
        // eslint-disable-next-line react/destructuring-assignment
        duration: humanizeDuration(props.value),
      })}
      customText={t('Blocks')}
      onChangePreset={value => {
        send('CHANGE', {id: props.id, value})
      }}
      onChangeCustom={({target}) => {
        send('CHANGE', {
          id: props.id,
          value: Number(target.value),
        })
      }}
      {...props}
    />
  )
}

export const VotingFilter = React.forwardRef(
  ({value, isChecked, children, ...props}, ref) => (
    <VotingStatusBadge
      ref={ref}
      value={value}
      aria-checked={isChecked}
      role="radio"
      pl={isChecked ? 1 : 3}
      {...props}
    >
      <Stack isInline spacing={1}>
        {isChecked && (
          <Icon name="tick" size={4} animation="0.3s both zoomIn" />
        )}
        <Text>{children}</Text>
      </Stack>
      <style jsx global>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale3d(0.7, 0.7, 0.7);
          }

          50% {
            opacity: 1;
          }
        }
      `}</style>
    </VotingStatusBadge>
  )
)
VotingFilter.displayName = 'VotingFilter'

export function VotingResult({
  options,
  votes = [],
  votesCount,
  voteProofsCount,
  actualVotesCount = votesCount || voteProofsCount,
  winnerThreshold,
  committeeSize,
  quorum,
  ...props
}) {
  const maxCount = Math.max(...votes.map(({count}) => count))

  return (
    <Stack {...props} title="">
      {options.map(({id, value}) => {
        const optionScore = votes.find(v => v.option === id)?.count ?? 0
        const isWinner =
          hasWinner({
            votes,
            votesCount,
            winnerThreshold,
            quorum,
            committeeSize,
          }) && optionScore >= winnerVotesCount({winnerThreshold, votesCount})
        return (
          <VotingResultBar
            key={id}
            label={value}
            value={optionScore}
            percentage={optionScore / actualVotesCount}
            isMax={maxCount === optionScore}
            isWinner={isWinner}
          />
        )
      })}
    </Stack>
  )
}

export function LaunchDrawer({
  balance,
  requiredBalance,
  available,
  from,
  isLoading,
  onLaunch,
  ...props
}) {
  const {t, i18n} = useTranslation()

  const dna = toLocaleDna(i18n.language)

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Launch Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {balanceInput, fromInput} = e.target.elements
          onLaunch({
            amount: Number(balanceInput.value),
            from: fromInput.value,
          })
        }}
      >
        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} isDisabled />
          <OracleFormHelper label={t('Available')} value={dna(available)} />
        </OracleFormControl>
        {requiredBalance - balance > 0 && (
          <OracleFormControl label={t('Send')}>
            <DnaInput
              name="balanceInput"
              defaultValue={requiredBalance - balance}
              step={10 ** -14}
            />
            <OracleFormHelper
              label={t('Minimum deposit required')}
              value={requiredBalance}
            />
            <OracleFormHelper
              label={t('Current contract balance')}
              value={balance}
            />
          </OracleFormControl>
        )}
        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Launching')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Launch')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function ProlongateDrawer({
  isLoading,
  from,
  available,
  onProlongate,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Prolongate Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput} = e.target.elements
          onProlongate({
            from: fromInput.value,
          })
        }}
      >
        <OracleFormHelperText>
          {t('Prolong the voting in order to select a new voting committee')}
        </OracleFormHelperText>

        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} isDisabled />
          <OracleFormHelper
            label={t('Available')}
            value={toLocaleDna(i18n.language)(available)}
          />
        </OracleFormControl>

        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Prolongating')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Prolong')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function LaunchVotingDrawer({votingService}) {
  const identity = useIdentityState()

  const [current, send] = useService(votingService)

  const {
    balance,
    feePerGas,
    oracleReward = minOracleReward(feePerGas),
    committeeSize,
  } = current.context

  return (
    <LaunchDrawer
      isOpen={eitherState(
        current,
        `idle.${VotingStatus.Pending}.review`,
        `mining.${VotingStatus.Starting}`
      )}
      onClose={() => {
        send('CANCEL')
      }}
      balance={Number(balance)}
      requiredBalance={votingMinBalance({
        oracleReward,
        committeeSize,
        feePerGas,
      })}
      from={identity.address}
      available={identity.balance}
      isLoading={current.matches(`mining.${VotingStatus.Starting}`)}
      onLaunch={e => {
        send('START_VOTING', e)
      }}
    />
  )
}

export function VotingMilestone({service}) {
  const {t} = useTranslation()

  const [current] = useService(service)

  const {
    createDate,
    startDate,
    finishDate,
    finishCountingDate,
    votes = [],
    votesCount,
    winnerThreshold,
    quorum,
    committeeSize,
  } = current.context

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase()))

  // eslint-disable-next-line no-nested-ternary
  const [nextPhaseLabel, nextPhaseDate] = eitherIdleState(
    VotingStatus.Deploying,
    VotingStatus.Pending,
    VotingStatus.Starting
  )
    ? [t('Start voting'), startDate]
    : // eslint-disable-next-line no-nested-ternary
    eitherIdleState(VotingStatus.Open, VotingStatus.Voting, VotingStatus.Voted)
    ? [t('End voting'), finishDate]
    : // eslint-disable-next-line no-nested-ternary
    eitherIdleState(
        VotingStatus.Counting,
        VotingStatus.Prolongating,
        VotingStatus.Finishing
      )
    ? // eslint-disable-next-line no-nested-ternary
      dayjs().isBefore(finishCountingDate)
      ? [t('End counting'), finishCountingDate]
      : hasWinner({votes, votesCount, winnerThreshold, quorum, committeeSize})
      ? [
          t(
            `Waiting for rewards ${
              isPendingTermination({finishCountingDate}) ? 'or termination' : ''
            }`
          ),
          null,
        ]
      : [
          t(
            `Waiting for prolongation ${
              isPendingTermination({finishCountingDate}) ? 'or termination' : ''
            }`
          ),
          null,
        ]
    : // eslint-disable-next-line no-nested-ternary
    eitherIdleState(VotingStatus.Archived, VotingStatus.Terminating)
    ? [t('Waiting for termination'), null]
    : eitherIdleState(VotingStatus.Terminated)
    ? [t('Terminated'), null]
    : []

  return (
    <Flex align="center" justify="space-between">
      <Box fontWeight={500}>
        <Text color="muted">{nextPhaseLabel}</Text>
        {nextPhaseDate && (
          <Text>
            {new Date(nextPhaseDate).toLocaleString()}
            {eitherIdleState(
              VotingStatus.Open,
              VotingStatus.Voted,
              VotingStatus.Counting
            ) && <Text as="span"> ({dayjs().to(nextPhaseDate)})</Text>}
          </Text>
        )}
      </Box>
      <Popover placement="top">
        <PopoverTrigger>
          <InfoButton display="inline-flex" />
        </PopoverTrigger>
        <PopoverContent
          bg="graphite.500"
          border="none"
          zIndex="popover"
          w="2xs"
          px={4}
          py={2}
          pb={4}
        >
          <PopoverArrow />
          <PopoverHeader borderBottom="none" p={0} mb={3}>
            <Text color="white" fontWeight={500}>
              {t('Full cycle')}
            </Text>
          </PopoverHeader>
          <PopoverBody p={0}>
            <Stack spacing="10px" fontSize="sm">
              <VotingMilestone.ListItem
                isActive={eitherIdleState(VotingStatus.Pending)}
                label={t('Created')}
                value={new Date(createDate).toLocaleString()}
              />
              <VotingMilestone.ListItem
                isActive={eitherIdleState(
                  VotingStatus.Pending,
                  VotingStatus.Open
                )}
                label={t('Start voting')}
                value={
                  eitherIdleState(VotingStatus.Pending)
                    ? '--'
                    : new Date(startDate).toLocaleString()
                }
              />
              <VotingMilestone.ListItem
                isActive={eitherIdleState(
                  VotingStatus.Pending,
                  VotingStatus.Open,
                  VotingStatus.Voted
                )}
                label={t('End voting')}
                value={
                  eitherIdleState(VotingStatus.Pending)
                    ? '--'
                    : new Date(finishDate).toLocaleString()
                }
              />
              <VotingMilestone.ListItem
                isActive={eitherIdleState(
                  VotingStatus.Pending,
                  VotingStatus.Open,
                  VotingStatus.Voted,
                  VotingStatus.Counting
                )}
                label={t('End counting')}
                value={
                  eitherIdleState(VotingStatus.Pending)
                    ? '--'
                    : new Date(finishCountingDate).toLocaleString()
                }
              />
            </Stack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
VotingMilestone.ListItem = VotingMilestoneListItem

export function VotingMilestoneListItem({label, value, isActive, ...props}) {
  const colorScheme = isActive
    ? {
        bg: 'xwhite.016',
        borderColor: 'gray.100',
        color: 'white',
      }
    : {
        bg: 'transparent',
        borderColor: 'xwhite.040',
        color: 'white',
      }

  return (
    <Flex justify="space-between" color="white" {...props}>
      <Stack isInline spacing={2} align="center">
        <Box
          {...colorScheme}
          borderRadius="full"
          borderWidth="1px"
          w="10px"
          h="10px"
        />
        <Text opacity={isActive ? 1 : 0.4}>{label}</Text>
      </Stack>
      <Text ml="auto" opacity={isActive ? 1 : 0.4}>
        {value}
      </Text>
    </Flex>
  )
}

export function FinishDrawer({isLoading, from, available, onFinish, ...props}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Finish Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput} = e.target.elements
          onFinish({
            from: fromInput.value,
          })
        }}
      >
        <OracleFormHelperText>
          {t('Finish the voting to declare the winner and pay rewards')}
        </OracleFormHelperText>

        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} isDisabled />
          <OracleFormHelper
            label={t('Available')}
            value={toLocaleDna(i18n.language)(available)}
          />
        </OracleFormControl>

        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Finishing')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Finish')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function TerminateDrawer({
  isLoading,
  from,
  available,
  onTerminate,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Terminate Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput} = e.target.elements
          onTerminate({
            from: fromInput.value,
          })
        }}
      >
        <OracleFormHelperText>
          {t(
            'Terminate the contract to clean-up its state and release the stake'
          )}
        </OracleFormHelperText>

        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} isDisabled />
          <OracleFormHelper
            label={t('Available')}
            value={toLocaleDna(i18n.language)(available)}
          />
        </OracleFormControl>

        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Terminating')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Terminate')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}
