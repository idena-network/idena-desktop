/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Button,
  Flex,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import QrCode from 'qrcode.react'
import {PrimaryButton} from '../../shared/components/button'
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerFooter,
  ExternalLink,
  FormLabel,
  Input,
  SmallText,
  Tooltip,
} from '../../shared/components/components'
import {
  WalletCardMenu,
  WalletCardMenuItem,
  WalletDrawer,
  WalletDrawerFormControl,
  WalletDrawerHeader,
  WalletDrawerHeaderIconBox,
} from './components'
import {callRpc, isAddress, toLocaleDna} from '../../shared/utils/utils'
import {
  Table,
  TableCol,
  TableHeaderCol,
  TableRow,
} from '../../shared/components/table'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationMarkIcon,
  LockIcon,
  ReceiveIcon,
  SendOutIcon,
} from '../../shared/components/icons'
import {useTrackTx} from '../ads/hooks'
import {useFormatDna} from '../../shared/hooks/hooks'

export function TotalAmount({address, amount}) {
  const {t, i18n} = useTranslation()

  return (
    <Stack spacing={1}>
      <Stat as={Stack} spacing="1px">
        <StatLabel color="muted" fontSize="md">
          {t('Total amount')}
        </StatLabel>
        <StatNumber
          color="brandGray.500"
          fontSize="lg"
          fontWeight={500}
          lineHeight="short"
        >
          {toLocaleDna(i18n.language)(amount)}
        </StatNumber>
      </Stat>
      <ExternalLink href={`https://scan.idena.io/address/${address}`}>
        {t('More details in Explorer')}
      </ExternalLink>
    </Stack>
  )
}

export function WalletCard({
  wallet: {name, balance, address, isStake},
  isSelected,
  onSend,
  onReceive,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Flex
      direction="column"
      justify="space-between"
      bg="gray.50"
      borderRadius="lg"
      p="4"
      pl="5"
      h="32"
      w="56"
      position="relative"
      {...props}
    >
      <Stack spacing={1}>
        <Flex justify="space-between" align="center">
          <Box fontWeight={500}>{name}</Box>
          {isStake ? (
            <LockIcon boxSize="4" color="muted" />
          ) : (
            <WalletCardMenu>
              <WalletCardMenuItem
                icon={<SendOutIcon boxSize="4" color="blue.500" />}
                onClick={onSend}
              >
                {t('Send')}
              </WalletCardMenuItem>
              <WalletCardMenuItem
                icon={<ReceiveIcon boxSize="4" color="blue.500" />}
                onClick={onReceive}
              >
                {t('Receive')}
              </WalletCardMenuItem>
            </WalletCardMenu>
          )}
        </Flex>
        <Box color="muted" isTruncated>
          {address}
        </Box>
      </Stack>
      <Stack spacing={1}>
        <Box color="muted">{t('Balance')}</Box>
        <Box fontWeight={500}>{toLocaleDna(i18n.language)(balance)}</Box>
      </Stack>
      {isSelected && (
        <Box
          position="absolute"
          left={-1}
          top={-1}
          right={-1}
          bottom={-1}
          boxShadow="0 0 0 4px rgba(87, 143, 255, 0.25), 0 0 0 1px rgb(87, 143, 255), inset 0 0 0 1px rgb(87, 143, 255);"
          borderRadius="xl"
        />
      )}
    </Flex>
  )
}

export function SendDnaDrawer({address, onSend, onFail, ...props}) {
  const {t} = useTranslation()

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      const {type = typeof action === 'string' && action, ...actionParams} =
        action

      switch (type) {
        case 'submit':
        case 'mine': {
          return {
            ...prevState,
            ...actionParams,
            status: 'pending',
          }
        }
        case 'done':
          return {
            ...prevState,
            hash: null,
            amount: null,
            to: null,
            status: 'done',
          }
        case 'error':
          return {...prevState, error: action.error, status: 'error'}

        default:
          return prevState
      }
    },
    {
      status: 'idle',
    }
  )

  const {onClose} = props

  useTrackTx(state.hash, {
    onMined: React.useCallback(() => {
      dispatch('done')
      onClose()
    }, [onClose]),
  })

  const isPending = state.status === 'pending'

  return (
    <WalletDrawer
      isMining={isPending}
      onClose={() => {
        dispatch('done')
        props.onClose()
      }}
      {...props}
    >
      <WalletDrawerHeader title={t('Send iDNA')}>
        <WalletDrawerHeaderIconBox colorScheme="red">
          <SendOutIcon color="red.500" />
        </WalletDrawerHeaderIconBox>
      </WalletDrawerHeader>
      <DrawerBody>
        <Box mt="6">
          <form
            id="sendDna"
            onSubmit={async (e) => {
              e.preventDefault()

              dispatch('submit')

              const {from, to, amount} = Object.fromEntries(
                new FormData(e.target)
              )

              try {
                if (!isAddress(to)) {
                  throw new Error(`Incorrect 'To' address: ${to}`)
                }

                if (amount <= 0) {
                  throw new Error(`Incorrect Amount: ${amount}`)
                }

                const result = await callRpc('dna_sendTransaction', {
                  to,
                  from,
                  amount,
                })
                // eslint-disable-next-line no-unused-expressions
                onSend?.(result)
                dispatch({type: 'mine', hash: result})
              } catch (error) {
                dispatch({type: 'error', error: error.message})
                // eslint-disable-next-line no-unused-expressions
                onFail?.(error.message)
              }
            }}
          >
            <Stack spacing="6">
              <WalletDrawerFormControl label={t('From')}>
                <Input name="from" defaultValue={address} isReadOnly />
              </WalletDrawerFormControl>
              <WalletDrawerFormControl label={t('To')}>
                <Input name="to" placeholder={t('Enter address')} />
              </WalletDrawerFormControl>
              <WalletDrawerFormControl label={t('Amount, iDNA')}>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  name="amount"
                  placeholder={t('Enter amount')}
                />
              </WalletDrawerFormControl>
            </Stack>
          </form>
        </Box>
      </DrawerBody>
      <DrawerFooter>
        <PrimaryButton
          type="submit"
          form="sendDna"
          isLoading={isPending}
          loadingText={t('Sending')}
        >
          {t('Send')}
        </PrimaryButton>
      </DrawerFooter>
    </WalletDrawer>
  )
}

export function ReceiveDnaDrawer({address, ...props}) {
  const {t} = useTranslation()

  const {onCopy} = useClipboard(address)

  return (
    <Drawer {...props}>
      <WalletDrawerHeader title={t('Receive iDNA')}>
        <WalletDrawerHeaderIconBox colorScheme="blue">
          <ReceiveIcon color="blue.500" />
        </WalletDrawerHeaderIconBox>
      </WalletDrawerHeader>
      <DrawerBody mt="5">
        <Stack spacing={10}>
          <Box
            boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
            p={2}
            mx="auto"
          >
            <QrCode value={address} style={{width: 144, height: 144}} />
          </Box>
          <WalletDrawerFormControl>
            <Flex align="center" justify="space-between">
              <FormLabel p={0}>{t('From')}</FormLabel>
              <Button
                variant="link"
                colorScheme="blue"
                fontWeight={500}
                _hover={null}
                _active={null}
                onClick={onCopy}
              >
                {t('Copy')}
              </Button>
            </Flex>
            <Input value={address} isDisabled />
            <Text color="muted" fontSize="md">
              {t(
                'Wallet will be updated after transaction is confirmed in the blockchain.'
              )}
            </Text>
          </WalletDrawerFormControl>
        </Stack>
      </DrawerBody>
    </Drawer>
  )
}

export function WalletTransactionList({txs = []}) {
  const {t} = useTranslation(['translation', 'error'])

  const formatDna = useFormatDna({maximumFractionDigits: 5})

  return (
    <Table>
      <thead>
        <TableRow>
          <TableHeaderCol style={{width: '144px'}}>
            {t('Transaction')}
          </TableHeaderCol>
          <TableHeaderCol style={{width: '240px'}}>
            {t('Address')}
          </TableHeaderCol>
          <TableHeaderCol>{t('Amount, iDNA')}</TableHeaderCol>
          <TableHeaderCol>{t('Date')}</TableHeaderCol>
        </TableRow>
      </thead>
      <tbody>
        {txs.map((tx, k) => (
          <TableRow key={k}>
            <TableCol>
              <WalletTxStatus tx={tx} />
            </TableCol>
            <TableCol>
              {(!tx.to && '\u2013') || (
                <Stack isInline spacing="3" align="center">
                  <Avatar
                    address={tx.counterParty}
                    boxSize={8}
                    bg="white"
                    border="solid 1px"
                    borderColor="gray.016"
                  />
                  <Box w="48">
                    <Text fontWeight={500} whiteSpace="nowrap">
                      {tx.direction === 'Sent' ? t('To') : t('From')}{' '}
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {tx.counterPartyWallet
                        ? `${t('wallet')} ${tx.counterPartyWallet.name}`
                        : tx.receipt
                        ? t('smart contract')
                        : t('address')}
                    </Text>
                    <SmallText fontWeight={500} isTruncated>
                      {tx.counterParty}
                    </SmallText>
                  </Box>
                </Stack>
              )}
            </TableCol>

            <TableCol>
              <Text
                color={tx.signAmount < 0 ? 'red.500' : 'brandGray.500'}
                fontWeight={500}
                overflowWrap="break-word"
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {tx.type === 'kill'
                  ? t('See in Explorer...')
                  : // eslint-disable-next-line no-nested-ternary
                  Number(tx.amount) === 0
                  ? '\u2013'
                  : tx.direction === 'Sent'
                  ? -tx.amount
                  : tx.amount}
              </Text>

              <Box fontWeight={500}>
                {!tx.isMining || tx.maxFee === '0' ? (
                  // eslint-disable-next-line react/jsx-no-useless-fragment
                  <>
                    {Number(tx.usedFee) > 0 && (
                      <SmallText>
                        {t('Fee')} {formatDna(tx.usedFee)}
                      </SmallText>
                    )}
                  </>
                ) : (
                  <SmallText>
                    {t('Fee limit')} {tx.maxFee}
                  </SmallText>
                )}
              </Box>
            </TableCol>

            <TableCol>
              <Text as="span" fontWeight={500}>
                {!tx.timestamp
                  ? '\u2013'
                  : new Date(tx.timestamp * 1000).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
              </Text>
              <SmallText>
                {t('Transaction')}:
                <ExternalLink
                  href={`https://scan.idena.io/transaction/${tx.hash}`}
                  fontSize="sm"
                  isTruncated
                  w="24"
                >
                  {tx.hash}
                </ExternalLink>
              </SmallText>
            </TableCol>
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}

function WalletTxStatus({
  tx: {direction, isMining, typeName, wallet, receipt},
}) {
  const {t} = useTranslation()

  const txColorAccent = direction === 'Sent' ? 'red' : 'blue'

  return (
    <Stack isInline>
      <Flex
        align="center"
        justify="center"
        alignSelf="center"
        bg={isMining ? 'muted' : `${txColorAccent}.012`}
        color={isMining ? 'muted' : `${txColorAccent}.500`}
        borderRadius="lg"
        minH={8}
        minW={8}
      >
        {direction === 'Sent' ? (
          <ArrowUpIcon boxSize="5" />
        ) : (
          <ArrowDownIcon boxSize="5" />
        )}
      </Flex>
      <Box>
        <Text color="brandGray.500" fontWeight={500}>
          {typeName}
        </Text>
        <SmallText fontWeight={500}>{wallet?.name}</SmallText>
        <Box fontWeight={500}>
          {isMining ? (
            <SmallText color="orange.500" fontWeight={500}>
              {t('Mining...')}
            </SmallText>
          ) : (
            <Stack isInline spacing={1} align="center">
              {receipt?.error && (
                <Tooltip
                  label={`${t('Smart contract failed')}: ${receipt?.error}`}
                >
                  <ExclamationMarkIcon boxSize="5" color="red.500" />
                </Tooltip>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Stack>
  )
}
