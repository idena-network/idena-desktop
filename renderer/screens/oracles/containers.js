/* eslint-disable react/prop-types */
import React from 'react'
import Link from 'next/link'
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
  FormControl,
  RadioGroup,
  Radio,
} from '@chakra-ui/core'
import dayjs from 'dayjs'
import getUrls from 'get-urls'
import {
  toLocaleDna,
  eitherState,
  callRpc,
  toPercent,
} from '../../shared/utils/utils'
import {
  Avatar,
  Debug,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  FormLabel,
  Input,
  Tooltip,
} from '../../shared/components/components'
import {VotingStatus} from '../../shared/types'

import {
  VotingBadge,
  OracleDrawerHeader,
  OracleDrawerBody,
  OracleFormControl,
  OracleFormHelper,
  OracleFormHelperText,
  PresetFormControl,
  DnaInput,
  PresetFormControlOptionList,
  PresetFormControlOption,
  PresetFormControlHelperText,
  PresetFormControlInputBox,
  BlockInput,
  OracleFormHelperSmall,
} from './components'
import {
  InfoButton,
  PrimaryButton,
  SecondaryButton,
} from '../../shared/components/button'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  createContractDataReader,
  createContractReadonlyCaller,
  hasWinner,
  humanizeDuration,
  viewVotingHref,
  votingFinishDate,
  votingMinBalance,
  isAllowedToTerminate,
  hasQuorum,
  mapVotingStatus,
  effectiveBalance,
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
    prevStatus,
    votingMinPayment,
    winnerThreshold,
    quorum,
    committeeSize,
    isOracle,
    totalReward,
    finishCountingDate,
    estimatedTotalReward,
    isNew,
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
    <Box position="relative" {...props}>
      {isNew && (
        <Box
          bg="gray.50"
          rounded="lg"
          position="absolute"
          top={-16}
          left={-16}
          right={-16}
          bottom={-16}
          opacity={0.5}
          zIndex="base"
        />
      )}
      <Box position="relative" zIndex={1}>
        <Stack isInline spacing={2} mb={3} align="center">
          <VotingStatusBadge status={status}>
            {t(mapVotingStatus(status))}
          </VotingStatusBadge>
          <VotingBadge
            align="center"
            bg="gray.50"
            color="muted"
            cursor="pointer"
            pl="1/2"
            onClick={() => {
              router.push(viewHref)
            }}
          >
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
        </Stack>
        <Link href={viewHref}>
          <Text
            isTruncated
            fontSize="base"
            fontWeight={500}
            cursor="pointer"
            mb={2}
          >
            {title}
          </Text>
        </Link>
        <Text isTruncated color="muted" mb={4}>
          {desc}
        </Text>
        {eitherIdleState(
          VotingStatus.Archived,
          VotingStatus.Terminated,
          VotingStatus.Counting
        ) && (
          <Stack spacing={2} mb={6}>
            <Text color="muted" fontSize="sm">
              {t('Results')}
            </Text>
            {votesCount ? (
              <VotingResult votingService={votingRef} {...current.context} />
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
            {isClosed ? t('Oracles rewards paid') : t('Prize pool')}:{' '}
            {toDna(isClosed ? totalReward : estimatedTotalReward)}
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
              ))}
            {eitherIdleState(
              VotingStatus.Voted,
              VotingStatus.Archived,
              VotingStatus.Terminated,
              VotingStatus.Counting
            ) && (
              <PrimaryButton onClick={() => router.push(viewHref)}>
                {t('View')}
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
                      finishCountingDate,
                    })
                      ? 'user-tick'
                      : 'user'
                  }
                  color="muted"
                  w={4}
                  h={4}
                />
                <Text as="span">
                  {t('{{count}} votes', {count: votesCount || voteProofsCount})}{' '}
                  {eitherIdleState(VotingStatus.Counting) &&
                    t('out of {{count}}', {count: voteProofsCount})}
                </Text>
              </Stack>
            </Stack>
          )}
        </Flex>
      </Box>
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

export function AddFundDrawer({
  from,
  to,
  available,
  ownerFee,
  isLoading,
  onAddFund,
  ...props
}) {
  const {t, i18n} = useTranslation()

  const toDna = toLocaleDna(i18n.language)

  const [{oracleAmount, ownerAmount}, setAmount] = React.useState({
    oracleAmount: 0,
    ownerAmount: 0,
  })

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
            <DnaInput
              name="amountInput"
              onChange={e => {
                // eslint-disable-next-line no-shadow
                const amount = Number(e.target.value)
                // eslint-disable-next-line no-shadow
                const oracleAmount = effectiveBalance({
                  balance: amount,
                  ownerFee,
                })
                setAmount({
                  oracleAmount,
                  ownerAmount: amount - oracleAmount,
                })
              }}
            />
            <OracleFormHelper
              label={t('Paid to oracles')}
              value={toDna(oracleAmount)}
            />
            <OracleFormHelper
              label={t('Paid to owner')}
              value={toDna(ownerAmount)}
            />
          </OracleFormControl>
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText={t('Sending')}
            mt={3}
            ml="auto"
          >
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
  publicVotingDuration,
  finishDate,
  finishCountingDate,
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
        {t('Voting')}: {option}
      </OracleDrawerHeader>
      <Box flex={1} overflowY="auto" mx={-30} px={30}>
        <OracleDrawerBody>
          <OracleFormControl label={t('Transfer from')}>
            <Input defaultValue={from} isDisabled />
            <OracleFormHelper label={t('Available')} value={toDna(balance)} />
          </OracleFormControl>
          <OracleFormControl label="To address">
            <Input isDisabled value={to} />
          </OracleFormControl>
          <OracleFormControl label={t('Voting Deposit, iDNA')}>
            <Input isDisabled value={deposit} />
          </OracleFormControl>
          <Stack spacing={2} bg="gray.50" borderRadius="md" py={5} px={6}>
            <OracleFormHelperSmall
              label={t('Vote counting')}
              value={t('About {{duration}}', {
                duration: humanizeDuration(publicVotingDuration),
              })}
            />
            <OracleFormHelperSmall
              label={t('Start counting')}
              value={new Date(finishDate).toLocaleString()}
            />
            <OracleFormHelperSmall
              label={t('End counting')}
              value={new Date(finishCountingDate).toLocaleString()}
            />
          </Stack>
          <OracleFormHelperText mt={0}>
            {t(
              'To get a reward for the voting you must be online at least once during the period of vote counting'
            )}
          </OracleFormHelperText>
        </OracleDrawerBody>
      </Box>
      <DrawerFooter>
        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Publishing')}
          onClick={onVote}
        >
          {t('Send')}
        </PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}

export function ReviewVotingDrawer({
  from,
  available,
  minBalance,
  minStake,
  ownerFee,
  isLoading,
  votingDuration,
  publicVotingDuration,
  onConfirm,
  ...props
}) {
  const {t, i18n} = useTranslation()

  const oracleAmount = effectiveBalance({
    balance: minBalance,
    ownerFee,
  })

  const toDna = toLocaleDna(i18n.language)

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Create Oracle Voting')}
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
        <FormControl>
          <FormLabel mb={2}>
            <Tooltip
              label={t(`Rewards will be paid to Oracles`)}
              placement="top"
              zIndex="tooltip"
            >
              <Text
                borderBottom="dotted 1px"
                borderBottomColor="muted"
                cursor="help"
              >
                {t('Rewards')}
              </Text>
            </Tooltip>
          </FormLabel>
          <DnaInput name="balanceInput" defaultValue={minBalance} isDisabled />
          <OracleFormHelper
            label={t('Paid to oracles')}
            value={toDna(oracleAmount)}
          />
          <OracleFormHelper
            label={t('Paid to owner')}
            value={toDna(minBalance - oracleAmount)}
          />
        </FormControl>
        <FormControl>
          <FormLabel mb={2}>
            <Tooltip
              label={t(
                '50% of the stake will be refunded to your address after termination'
              )}
              placement="top"
              zIndex="tooltip"
            >
              <Text
                borderBottom="dotted 1px"
                borderBottomColor="muted"
                cursor="help"
              >
                {t('Stake')}
              </Text>
            </Tooltip>
          </FormLabel>
          <DnaInput name="stakeInput" defaultValue={minStake} isDisabled />
        </FormControl>
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

export function VotingDurationInput({
  id,
  value,
  presets,
  tooltip,
  service,
  ...props
}) {
  const {t} = useTranslation()

  const [, send] = useService(service)

  return (
    <PresetFormControl tooltip={tooltip} {...props}>
      <PresetFormControlOptionList
        value={value}
        // eslint-disable-next-line no-shadow
        onChange={value => {
          send('CHANGE', {id, value})
        }}
      >
        {presets.map(({label, value: presetValue}) => (
          <PresetFormControlOption key={presetValue} value={presetValue}>
            {label}
          </PresetFormControlOption>
        ))}
      </PresetFormControlOptionList>
      <PresetFormControlInputBox>
        <BlockInput
          id={id}
          value={value}
          onChange={({target}) => {
            send('CHANGE', {
              id,
              value: Number(target.value),
            })
          }}
        />
        <PresetFormControlHelperText>
          {t('About {{duration}}', {
            duration: humanizeDuration(value),
          })}
        </PresetFormControlHelperText>
      </PresetFormControlInputBox>
    </PresetFormControl>
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

export function VotingResult({votingService, ...props}) {
  const [current] = useService(votingService)

  const {
    options,
    votes = options.map(({id}) => ({option: id, count: 0})),
    votesCount,
    winnerThreshold,
    committeeSize,
    quorum,
    selectedOption = -1,
    finishCountingDate,
  } = current.context

  const didDetermineWinner = hasWinner({
    votes,
    votesCount,
    winnerThreshold,
    quorum,
    committeeSize,
    finishCountingDate,
  })

  const max = Math.max(...votes.map(({count}) => count))

  return (
    <Stack {...props}>
      {options.map(({id, value}) => {
        const currentValue = votes.find(v => v.option === id)?.count ?? 0
        return (
          <VotingResultBar
            key={id}
            label={value}
            value={currentValue}
            max={max}
            isMine={id === selectedOption}
            didVote={selectedOption > -1}
            isWinner={didDetermineWinner && currentValue === max}
            votesCount={votesCount}
          />
        )
      })}
    </Stack>
  )
}

function VotingResultBar({
  label,
  value,
  max,
  isMine,
  isWinner,
  votesCount,
  didVote,
  ...props
}) {
  const percentage = value / max

  return (
    <Flex
      align="center"
      justify="space-between"
      textTransform="capitalize"
      position="relative"
      px={2}
      h={6}
      w="full"
      {...props}
    >
      <Box
        borderRadius="md"
        bg={isWinner ? 'blue.012' : 'gray.50'}
        h={6}
        width={percentage > 0 ? `${percentage * 100}%` : 2}
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        zIndex="base"
      />
      <Stack isInline spacing={2} align="center" zIndex={1}>
        {didVote && (
          <Flex
            align="center"
            justify="center"
            bg={isMine ? 'brandBlue.500' : 'transparent'}
            borderRadius="full"
            borderWidth={isMine ? 0 : '4px'}
            borderColor="gray.100"
            color="white"
            w={4}
            h={4}
          >
            {isMine && <Icon name="ok" size={3} />}
          </Flex>
        )}
        <Text isTruncated maxW="sm" title={label.length > 50 ? label : ''}>
          {label}
        </Text>
      </Stack>
      <Text fontWeight={500} textTransform="initial" zIndex={1}>
        {votesCount === 0
          ? toPercent(0)
          : toPercent(value / Number(votesCount))}{' '}
        ({value})
      </Text>
    </Flex>
  )
}

export function LaunchDrawer({
  balance,
  requiredBalance,
  available,
  from,
  ownerFee,
  isLoading,
  onLaunch,
  ...props
}) {
  const {t, i18n} = useTranslation()

  const dna = toLocaleDna(i18n.language)

  const oracleAmount = effectiveBalance({
    balance: requiredBalance - balance,
    ownerFee,
  })

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Launch Oracle Voting')}
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
        <OracleFormControl label={t('Send')}>
          <DnaInput
            name="balanceInput"
            defaultValue={Math.max(requiredBalance - balance, 0)}
            step="any"
          />
          <OracleFormHelper
            label={t('Minimum deposit required')}
            value={dna(requiredBalance)}
          />
          <OracleFormHelper
            label={t('Current contract balance')}
            value={dna(balance)}
          />
          <OracleFormHelper
            label={t('Paid to oracles')}
            value={dna(oracleAmount)}
          />
          <OracleFormHelper
            label={t('Paid to owner')}
            value={dna(requiredBalance - balance - oracleAmount)}
          />
        </OracleFormControl>
        )
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

export function ProlongDrawer({
  isLoading,
  from,
  available,
  onProlong,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Prolong Oracle Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput} = e.target.elements
          onProlong({
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
          loadingText={t('Prolonging')}
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

  const {balance, minOracleReward, committeeSize, ownerFee} = current.context

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
        minOracleReward,
        committeeSize,
      })}
      ownerFee={ownerFee}
      from={identity.address}
      available={identity.balance}
      isLoading={current.matches(`mining.${VotingStatus.Starting}`)}
      onLaunch={e => {
        send('START_VOTING', e)
      }}
    />
  )
}

export function VotingPhase({service}) {
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
    estimatedTerminationTime,
    finishTime,
    terminationTime,
  } = current.context

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase()))

  const didDetermineWinner = hasWinner({
    votes,
    votesCount,
    winnerThreshold,
    quorum,
    committeeSize,
    finishCountingDate,
  })

  const didReachQuorum = hasQuorum({votesCount, quorum, committeeSize})

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
        VotingStatus.Prolonging,
        VotingStatus.Finishing
      )
    ? // eslint-disable-next-line no-nested-ternary
      dayjs().isBefore(finishCountingDate)
      ? [
          didDetermineWinner
            ? t('Waiting for rewards distribution')
            : t('End counting'),
          finishCountingDate,
        ]
      : didReachQuorum
      ? [
          // eslint-disable-next-line no-nested-ternary
          didDetermineWinner
            ? isAllowedToTerminate({estimatedTerminationTime})
              ? t('Waiting for rewards distribution or termination')
              : t('Waiting for rewards distribution')
            : isAllowedToTerminate({estimatedTerminationTime})
            ? t('Waiting for refunds or termination')
            : t('Waiting for refunds'),
          null,
        ]
      : [
          isAllowedToTerminate({estimatedTerminationTime})
            ? t('Waiting for prolongation or termination')
            : t('Waiting for prolongation'),
          null,
        ]
    : // eslint-disable-next-line no-nested-ternary
    eitherIdleState(VotingStatus.Archived, VotingStatus.Terminating)
    ? [t('Waiting for termination'), finishTime]
    : eitherIdleState(VotingStatus.Terminated)
    ? [t('Terminated'), terminationTime]
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
              {t('Voting timeline')}
            </Text>
          </PopoverHeader>
          <PopoverBody p={0}>
            <Stack spacing="10px" fontSize="sm">
              <VotingPhase.ListItem
                isActive={false}
                label={t('Created')}
                value={new Date(createDate).toLocaleString()}
              />
              <VotingPhase.ListItem
                isActive={eitherIdleState(VotingStatus.Pending)}
                label={t('Start voting')}
                value={
                  eitherIdleState(VotingStatus.Pending)
                    ? '--'
                    : new Date(startDate).toLocaleString()
                }
              />
              <VotingPhase.ListItem
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
              <VotingPhase.ListItem
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
VotingPhase.ListItem = VotingMilestoneListItem

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

export function FinishDrawer({
  isLoading,
  from,
  available,
  // eslint-disable-next-line no-shadow
  hasWinner,
  onFinish,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {hasWinner ? t('Distribute rewards') : t('Refund Oracle Voting')}
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
          {hasWinner
            ? t('Declare the winner and pay rewards to oracles.')
            : t('Finish voting and refund oracles with their lock funds.')}
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
          loadingText={hasWinner ? t('Distributing') : t('Refunding')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {hasWinner ? t('Distribute rewards') : t('Refund')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function TerminateDrawer({
  isLoading,
  contractAddress,
  onTerminate,
  ...props
}) {
  const {t} = useTranslation()

  return (
    <Drawer isCloseable={!isLoading} {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Terminate Oracle Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          onTerminate()
        }}
      >
        <OracleFormHelperText>
          {t(
            'Terminate the contract to clean-up its state and refund 50% of the stake to the owner'
          )}
        </OracleFormHelperText>

        <OracleFormControl label={t('Smart contract address')}>
          <Input defaultValue={contractAddress} isDisabled />
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

function splitMany(str, ...separators) {
  const acc = []
  let nextStr = str

  for (const s of separators) {
    const [s1, s2] = nextStr.split(s)
    acc.push(s1, s)
    nextStr = s2
  }

  acc.push(nextStr)

  return acc
}

export function Linkify({onClick, children}) {
  if (!children) return null

  if (typeof children !== 'string') throw new Error('Only text nodes supported')

  const urls = getUrls(children, {stripWWW: false})
  const parts = urls.size > 0 ? splitMany(children, ...urls) : [children]

  return (
    <>
      {parts.map(part =>
        part.startsWith('http') ? (
          <Button
            variant="link"
            variantColor="brandBlue"
            fontWeight={500}
            _hover={{background: 'transparent'}}
            _focus={{
              outline: 'none',
            }}
            onClick={() => {
              onClick(part)
            }}
          >
            {part}
          </Button>
        ) : (
          <>{part}</>
        )
      )}
    </>
  )
}

export function NewOraclePresetDialog({onChoosePreset, onCancel, ...props}) {
  const {t} = useTranslation()

  const [preset, setPreset] = React.useState()

  return (
    <Dialog size={416} onClose={onCancel} {...props}>
      <DialogHeader mb={4}>{t('New Oracle voting')}</DialogHeader>
      <DialogBody>
        <Stack>
          <Text color="muted" fontSize="sm">
            {t('Choose an option to vote')}
          </Text>
          <RadioGroup spacing={0} onChange={e => setPreset(e.target.value)}>
            <Radio value="fact" alignItems="baseline" borderColor="gray.100">
              <Stack spacing={1} pt={2} pb={3}>
                <Text>{t('Fact certification')}</Text>
                <Text color="muted">
                  {t(
                    'Oracles who vote against the majority are penalized. Voting will be started in a future date.'
                  )}
                </Text>
              </Stack>
            </Radio>
            <Radio value="poll" alignItems="baseline" borderColor="gray.100">
              <Stack spacing={1} pt={2} pb={3}>
                <Text>{t('Poll')}</Text>
                <Text color="muted">
                  {t(
                    'Oracles can vote for any option. Rewards will be paid to everyone regardless of the outcome of the vote.'
                  )}
                </Text>
              </Stack>
            </Radio>
            <Radio
              value="decision"
              alignItems="baseline"
              borderColor="gray.100"
            >
              <Stack spacing={1} pt={2} pb={3}>
                <Text>{t('Making decision')}</Text>
                <Text color="muted">
                  {t('51% consensus is required to make a desision')}
                </Text>
              </Stack>
            </Radio>
            <Radio value="custom" borderColor="gray.100">
              {t('Custom')}
            </Radio>
          </RadioGroup>
        </Stack>
      </DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onCancel}>{t('Cancel')}</SecondaryButton>
        <PrimaryButton onClick={() => onChoosePreset(preset)}>
          {t('Continue')}
        </PrimaryButton>
      </DialogFooter>
    </Dialog>
  )
}
