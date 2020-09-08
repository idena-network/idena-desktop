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
  Skeleton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {useRouter} from 'next/router'
import {Page} from '../../screens/app/components'
import {Avatar, FloatDebug} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {toLocaleDna} from '../../shared/utils/utils'
import {VotingBadge} from '../../screens/oracles/components'
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

export default function ViewVotingPage() {
  const {t, i18n} = useTranslation()

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

  const viewMachine = React.useMemo(() => createViewVotingMachine(id, epoch), [
    epoch,
    id,
  ])
  const [current, send] = useMachine(viewMachine)

  const toDna = toLocaleDna(i18n.language)

  const {
    title,
    desc,
    issuer,
    status,
    finishDate,
    fundingAmount = 0,
    votesCount = 0,
    contractHash,
    quorum = 0,
    deposit = 0,
  } = current.context

  return (
    <>
      <Page pt={8}>
        <Skeleton isLoaded={!current.matches('loading')}>
          <Stack isInline spacing={10} w="full">
            <Box minWidth="lg" maxW="lg">
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
              <Stack spacing={6}>
                <Box borderRadius="md" bg="gray.50" py={8} px={10}>
                  <Heading fontSize={rem(21)} fontWeight={500} mb={4}>
                    {title}
                  </Heading>
                  <Text lineHeight="tall">{desc}</Text>
                </Box>
                <Box>
                  <Text color="muted" fontSize="sm" mb={3}>
                    {t('Choose an option to vote')}
                  </Text>
                  <RadioGroup>
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
                        onClick={onOpenConfirm}
                        name="option"
                      >
                        {t('Confirm')}
                      </Radio>
                      <Text color="muted" fontSize="sm">
                        {t('{{quorum}} votes required', {quorum})}
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
                        onClick={onOpenReject}
                      >
                        {t('Reject')}
                      </Radio>
                      <Text color="muted" fontSize="sm">
                        {t('{{quorum}} votes required', {quorum})}
                      </Text>
                    </Flex>
                  </RadioGroup>
                </Box>
                <Flex justify="space-between" align="center">
                  <Stack isInline spacing={2}>
                    <PrimaryButton onClick={() => send('VOTE')}>
                      {t('Vote')}
                    </PrimaryButton>
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
                      <Icon name="user" w={4} h={4} />
                      <Text as="span">
                        {t('{{votesCount}} votes', {votesCount})}
                      </Text>
                    </Stack>
                  </Stack>
                </Flex>
              </Stack>
            </Box>
            <Box mt={20}>
              <Stat mb={8}>
                <StatLabel color="muted" fontSize="md">
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
                <AsideStat label={t('Deposit')} value={toDna(deposit)} />
                <AsideStat label={t('Your reward')} value={toDna(500000000)} />
                <AsideStat
                  label={t('Quorum required')}
                  value={t('{{quorum}} votes', {quorum})}
                />
                <AsideStat
                  label={t('Deadline')}
                  value={new Date(finishDate).toLocaleDateString()}
                />
              </Stack>
            </Box>
          </Stack>
        </Skeleton>
      </Page>

      <VoteDrawer
        isOpen={isOpenConfirm}
        onClose={onCloseConfirm}
        option={VoteOption.Confirm}
        from={address}
        to={contractHash}
        deposit={deposit}
        onVote={() => send('VOTE', {option: VoteOption.Confirm})}
      />

      <VoteDrawer
        isOpen={isOpenReject}
        onClose={onCloseReject}
        option={VoteOption.Reject}
        from={address}
        to={contractHash}
        deposit={deposit}
        onVote={() => send('VOTE', {option: VoteOption.Reject})}
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
