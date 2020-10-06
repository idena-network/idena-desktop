import React from 'react'
import {
  Stack,
  Box,
  Text,
  Heading,
  RadioGroup,
  Radio,
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
import {
  Avatar,
  Debug,
  FloatDebug,
  Input,
  Toast,
} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {callRpc, toLocaleDna} from '../../shared/utils/utils'
import {VotingBadge, VotingSkeleton} from '../../screens/oracles/components'
import {
  AddFundDrawer,
  VotingStatusBadge,
  VoteDrawer,
  AsideStat,
} from '../../screens/oracles/containers'
import {createViewVotingMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VoteOption} from '../../shared/types'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  createContractDataReader,
  createContractReadonlyCaller,
} from '../../screens/oracles/utils'

export default function ViewVotingPage() {
  const {t, i18n} = useTranslation()

  const toast = useToast()

  const {
    isOpen: isOpenConfirm,
    onOpen: onOpenConfirm,
    onClose: onCloseConfirm,
  } = useDisclosure()

  const {
    isOpen: isOpenReject,
    onOpen: onOpenReject,
    onClose: onCloseReject,
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

  const {address} = useIdentityState()

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
    pubicVotingDuration = 0,
    quorum = 0,
    committeeSize = 100,
    options = [],
    votesCount = 0,
  } = current.context

  const finishDate = dayjs(startDate)
    .add(votingDuration, 's')
    .add(pubicVotingDuration, 's')

  const isLoaded = !current.matches('loading')

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
              <VotingSkeleton isLoaded={isLoaded}>
                <Box>
                  <Text color="muted" fontSize="sm" mb={3}>
                    {t('Choose an option to vote')}
                  </Text>
                  <RadioGroup
                    onChange={e =>
                      send('SELECT_OPTION', {option: e.target.value})
                    }
                  >
                    <Flex
                      justify="space-between"
                      border="1px"
                      borderColor="gray.300"
                      borderRadius="md"
                      px={3}
                      py={2}
                    >
                      <Radio
                        borderColor="gray.100"
                        name="option"
                        value={options[0]}
                        onClick={onOpenConfirm}
                      >
                        {t(options[0])}
                      </Radio>
                      <Text color="muted" fontSize="sm">
                        {t('{{count}} votes required', {count: committeeSize})}
                      </Text>
                    </Flex>
                    <Flex
                      justify="space-between"
                      border="1px"
                      borderColor="gray.300"
                      borderRadius="md"
                      px={3}
                      py={2}
                    >
                      <Radio
                        borderColor="gray.100"
                        variantColor="red"
                        name="option"
                        value={options[1]}
                        onClick={onOpenReject}
                      >
                        {t(options[1])}
                      </Radio>
                      <Text color="muted" fontSize="sm">
                        {t('{{count}} votes required', {count: committeeSize})}
                      </Text>
                    </Flex>
                  </RadioGroup>
                </Box>
              </VotingSkeleton>
              <VotingSkeleton isLoaded={isLoaded}>
                <Flex justify="space-between" align="center">
                  <Stack isInline spacing={2}>
                    <PrimaryButton
                      variantColor="green"
                      onClick={() => {
                        send('START_VOTING')
                      }}
                    >
                      {t('Start voting')}
                    </PrimaryButton>
                    <PrimaryButton onClick={() => send('VOTE_SELECTED')}>
                      {t('Vote')}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => redirect('/oracles/list')}>
                      {t('Cancel')}
                    </SecondaryButton>
                    <PrimaryButton
                      variantColor="red"
                      ml="auto"
                      onClick={() => {
                        send('TERMINATE_CONTRACT')
                      }}
                    >
                      {t('Terminate')}
                    </PrimaryButton>
                  </Stack>
                  <Stack isInline spacing={3}>
                    <Divider
                      orientation="vertical"
                      borderColor="gray.300"
                      borderLeft="1px"
                    />
                    <Stack isInline spacing={2} align="center">
                      <Icon name="user" w={4} h={4} />
                      <Text as="span">
                        {t('{{count}} votes', {count: votesCount})}
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
                  value={toDna(fundingAmount / committeeSize)}
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

        <VotingDevTools {...current.context} />
      </Page>

      <VoteDrawer
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        option={VoteOption.Confirm}
        from={address}
        to={contractHash}
        deposit={votingMinPayment}
        onVote={() => send('VOTE', {option: 0})}
      />

      <VoteDrawer
        isOpen={isOpenReject}
        onClose={onCloseReject}
        option={VoteOption.Reject}
        from={address}
        to={contractHash}
        deposit={votingMinPayment}
        onVote={() => send('VOTE', {option: 1})}
      />

      <AddFundDrawer
        isOpen={isOpenAddFund}
        onClose={onCloseAddFund}
        from={issuer}
        to={contractHash}
        onAddFund={amount => {
          send('ADD_FUND', {amount})
          onCloseAddFund()
        }}
      />

      <FloatDebug>{current.value}</FloatDebug>
    </>
  )
}

function VotingDevTools(contract) {
  const [result, setResult] = React.useState({})
  return (
    <Stack spacing={4} w="lg" mt={10}>
      <Divider borderColor="gray.300" w="full" />
      <Heading fontSize="lg" fontWeight={500}>
        Voting DevTools
      </Heading>
      <Stack>
        <Box>
          <Heading fontSize="base" fontWeight={500} my={4}>
            Contract
          </Heading>
          <Debug>{contract}</Debug>
        </Box>
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
            <Input id="readonlyCallArgs" placeholder="readonlyCall args" />
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
            <SecondaryButton type="submit" ml="auto" onClick={async () => {}}>
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
                await callRpc('bcn_txReceipt', e.target.elements.txHash.value)
              )
            }}
          >
            <Stack isInline>
              <Input id="txHash" placeholder="txHash" />
            </Stack>
            <SecondaryButton type="submit" ml="auto" onClick={async () => {}}>
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
                await callRpc('contract_getStake', contract.contractHash)
              )
            }}
          >
            <Stack isInline>
              <Input value={contract.contractHash} isReadonly isDisabled />
            </Stack>
            <SecondaryButton type="submit" ml="auto" onClick={async () => {}}>
              Get stake
            </SecondaryButton>
          </Stack>
        </Box>
      </Stack>
      <Debug>{result}</Debug>
    </Stack>
  )
}
