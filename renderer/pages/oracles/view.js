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
import {
  Avatar,
  Drawer,
  Input,
  FloatDebug,
} from '../../shared/components/components'
import {rem} from '../../shared/theme'
import {
  PrimaryButton,
  SecondaryButton,
  IconButton2,
} from '../../shared/components/button'
import {toLocaleDna} from '../../shared/utils/utils'
import {
  OracleDrawerHeader,
  OracleDrawerBody,
  OracleFormHelper,
  OracleFormControl,
  VotingBadge,
} from '../../screens/oracles/components'
import {
  AddFundDrawer,
  VotingStatusBadge,
} from '../../screens/oracles/containers'
import {createViewVotingMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'

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
    deposit = 100,
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
                  <RadioGroup value="confirm">
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
                        value="confirm"
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
                        value="reject"
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
                <Stat>
                  <StatLabel color="muted" fontSize="md">
                    {t('Deposit')}
                  </StatLabel>
                  <StatNumber fontSize={rem(16)} fontWeight={500}>
                    {toDna(deposit)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="muted" fontSize="md">
                    {t('Your reward')}
                  </StatLabel>
                  <StatNumber fontSize={rem(16)} fontWeight={500}>
                    {toDna(500000000)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="muted" fontSize="md">
                    {t('Quorum required')}
                  </StatLabel>
                  <StatNumber fontSize={rem(16)} fontWeight={500}>
                    {t('{{quorum}} votes', {quorum})}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="muted" fontSize="md">
                    {t('Deadline')}
                  </StatLabel>
                  <StatNumber fontSize={rem(16)} fontWeight={500}>
                    {new Date(finishDate).toLocaleString()}
                  </StatNumber>
                </Stat>
              </Stack>
            </Box>
          </Stack>
        </Skeleton>
      </Page>

      <Drawer isOpen={isOpenConfirm} onClose={onCloseConfirm}>
        <OracleDrawerHeader icon="send-out">
          {t('Voting: confirm', {nsSeparator: '!'})}
        </OracleDrawerHeader>
        <OracleDrawerBody>
          <OracleFormControl label={t('Transfer from')}>
            <Input defaultValue={issuer} />
            <OracleFormHelper label={t('Available')} value={toDna(80200)} />
          </OracleFormControl>
          <OracleFormControl label="To address">
            <Input isDisabled value={contractHash} />
          </OracleFormControl>
          <OracleFormControl label={t('Deposit, DNA')}>
            <Input isDisabled value={deposit} />
            <OracleFormHelper label={t('Fee')} value={toDna(0.01)} />
            <OracleFormHelper
              label={t('Total amount')}
              value={toDna(deposit * 1.01)}
            />
          </OracleFormControl>
          <PrimaryButton mt={3} ml="auto">
            {t('Send')}
          </PrimaryButton>
        </OracleDrawerBody>
      </Drawer>

      <Drawer isOpen={isOpenReject} onClose={onCloseReject}>
        <OracleDrawerHeader icon="send-out" variantColor="red">
          {t('Voting: reject', {nsSeparator: '!'})}
        </OracleDrawerHeader>
        <OracleDrawerBody>
          <OracleFormControl label={t('Transfer from')}>
            <Input defaultValue={issuer} />
          </OracleFormControl>
          <OracleFormControl label="To address">
            <Input isDisabled value={contractHash} />
          </OracleFormControl>
          <OracleFormControl label={t('Deposit, DNA')}>
            <Input isDisabled defaultValue={deposit} />
            <OracleFormHelper label={t('Fee')} value={toDna(0.01)} />
            <OracleFormHelper
              label={t('Total amount')}
              value={toDna(deposit * 1.01)}
            />
          </OracleFormControl>
          <PrimaryButton mt={3} ml="auto">
            {t('Send')}
          </PrimaryButton>
        </OracleDrawerBody>
      </Drawer>

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
