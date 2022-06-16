/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  HStack,
  Icon,
  MenuItem,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Text,
  Thead,
  Tr,
  useClipboard,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {PrimaryButton} from '../../shared/components/button'
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerFooter,
  ExternalLink,
  FormLabel,
  IconDrawerHeader,
  Input,
  QrCode,
  RoundedTh,
  SmallText,
  Tooltip,
} from '../../shared/components/components'
import {WalletCardMenu, WalletListTd} from './components'
import {callRpc, toLocaleDna} from '../../shared/utils/utils'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  LockIcon,
  SendOutIcon,
} from '../../shared/components/icons'
import {DnaInput} from '../oracles/components'

export function TotalAmount({address, amount}) {
  const {t, i18n} = useTranslation()

  return (
    <Stack spacing="2" align="flex-start">
      <Stat>
        <StatLabel color="muted" fontSize="md" h="4.5" lineHeight="4.5">
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
  onSend,
  onReceive,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Box position="relative">
      <Stack
        spacing="4"
        bg="gray.50"
        borderRadius="lg"
        p="4"
        pl="5"
        w="56"
        {...props}
      >
        <Stack spacing="1">
          <Box fontWeight={500}>{name}</Box>
          <Box color="muted" isTruncated>
            {address}
          </Box>
        </Stack>
        <Stack spacing="1">
          <Box color="muted">{t('Balance')}</Box>
          <Box fontWeight={500}>{toLocaleDna(i18n.language)(balance)}</Box>
        </Stack>
      </Stack>
      {!isStake && (
        <Box
          position="absolute"
          top="-1"
          left="-1"
          bottom="-1"
          right="-1"
          boxShadow="0 0 0 4px rgba(87, 143, 255, 0.25), 0 0 0 1px rgb(87, 143, 255), inset 0 0 0 1px rgb(87, 143, 255)"
          borderRadius="xl"
          zIndex="hide"
        />
      )}
      <Box position="absolute" top="4" right="4">
        {isStake ? (
          <LockIcon boxSize="5" color="muted" />
        ) : (
          <WalletCardMenu>
            <MenuItem
              icon={
                <SendOutIcon
                  boxSize="5"
                  transform="scaleX(-1)"
                  color="blue.500"
                />
              }
              onClick={onSend}
            >
              {t('Send')}
            </MenuItem>
            <MenuItem
              icon={<SendOutIcon boxSize="5" color="blue.500" />}
              onClick={onReceive}
            >
              {t('Receive')}
            </MenuItem>
          </WalletCardMenu>
        )}
      </Box>
    </Box>
  )
}

export function SendDrawer({address, onSend, onFail, ...props}) {
  const {t} = useTranslation()

  const [isSubmitting, setIsSubmitting] = React.useState()

  return (
    <Drawer {...props}>
      <IconDrawerHeader icon={<SendOutIcon boxSize="5" />}>
        {t('Send iDNA')}
      </IconDrawerHeader>
      <DrawerBody>
        <form
          id="send"
          onSubmit={async e => {
            e.preventDefault()

            const {from, to, amount} = Object.fromEntries(
              new FormData(e.target)
            )

            try {
              setIsSubmitting(true)
              const result = await callRpc('dna_sendTransaction', {
                to,
                from,
                amount,
              })
              onSend(result)
              setIsSubmitting(false)
            } catch (error) {
              setIsSubmitting(false)
              onFail({
                title: t('Error while sending transaction'),
                body: error.message,
              })
              onFail(error)
            }
          }}
        >
          <Stack spacing="5">
            <FormControl as={Stack} spacing={3}>
              <FormLabel>{t('From')}</FormLabel>
              <Input name="from" value={address} isDisabled />
            </FormControl>
            <FormControl as={Stack} spacing={3}>
              <FormLabel>{t('To')}</FormLabel>
              <Input name="to" placeholder={t('Enter address')} />
            </FormControl>
            <FormControl as={Stack} spacing={3}>
              <FormLabel>{t('Amount, iDNA')}</FormLabel>
              <DnaInput name="amount" placeholder={t('Enter amount')} />
            </FormControl>
          </Stack>
        </form>
      </DrawerBody>
      <DrawerFooter>
        <PrimaryButton
          type="submit"
          form="send"
          isLoading={isSubmitting}
          loadingText={t('Sending')}
        >
          {t('Send')}
        </PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}

export function ReceiveDrawer({address, ...props}) {
  const {t} = useTranslation()

  const {onCopy} = useClipboard(address)

  return (
    <Drawer {...props}>
      <IconDrawerHeader icon={<SendOutIcon color="blue" />}>
        {t('Receive iDNA')}
      </IconDrawerHeader>
      <DrawerBody mt={5}>
        <Stack spacing={10}>
          <QrCode value={address} />
          <FormControl>
            <Flex align="center" justify="space-between" mb="3">
              <FormLabel p={0}>{t('From')}</FormLabel>
              <Button variant="link" colorScheme="blue" onClick={onCopy}>
                {t('Copy')}
              </Button>
            </Flex>
            <Input value={address} isDisabled />
            <FormHelperText color="muted" fontSize="md">
              {t(
                'Wallet will be updated after transaction is confirmed in the blockchain.'
              )}
            </FormHelperText>
          </FormControl>
        </Stack>
      </DrawerBody>
    </Drawer>
  )
}

export function WalletTransactionList({txs = []}) {
  const {t} = useTranslation(['translation', 'error'])

  return (
    <Table color="gray.500" sx={{tableLayout: 'fixed'}}>
      <Thead>
        <Tr>
          <RoundedTh isLeft>{t('Transaction')}</RoundedTh>
          <RoundedTh>{t('Address')}</RoundedTh>
          <RoundedTh>{t('Amount, iDNA')}</RoundedTh>
          <RoundedTh isRight>{t('Date')}</RoundedTh>
        </Tr>
      </Thead>
      <Tbody>
        {txs.map(tx => (
          <Tr key={tx}>
            <WalletListTd>
              <WalletTxStatus tx={tx} />
            </WalletListTd>
            <WalletListTd>
              {tx.to ? (
                <HStack spacing={3} align="center">
                  <Avatar
                    address={tx.counterParty}
                    bg="white"
                    border="solid 1px"
                    borderColor="gray.016"
                    w="8"
                    h="8"
                  />
                  <Box maxW="32">
                    <Text fontWeight={500} isTruncated>
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
                </HStack>
              ) : (
                '--'
              )}
            </WalletListTd>

            <WalletListTd>
              <Text
                color={tx.signAmount < 0 ? 'red.500' : 'gray.500'}
                fontWeight={500}
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {tx.type === 'kill'
                  ? t('See in Explorer...')
                  : // eslint-disable-next-line no-nested-ternary
                  Number(tx.amount) === 0
                  ? '--'
                  : tx.direction === 'Sent'
                  ? -tx.amount
                  : tx.amount}
              </Text>

              <Box fontWeight={500}>
                {!tx.isMining || tx.maxFee === '0' ? (
                  <>
                    {Number(tx.usedFee) > 0 && (
                      <SmallText>
                        {t('Fee')} {tx.usedFee}
                      </SmallText>
                    )}
                  </>
                ) : (
                  <SmallText>
                    {t('Fee limit')} {tx.maxFee}
                  </SmallText>
                )}
              </Box>
            </WalletListTd>
            <WalletListTd>
              <Text as="span" fontWeight={500}>
                {tx.timestamp
                  ? new Date(tx.timestamp * 1000).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '--'}
              </Text>
              <HStack spacing="1">
                <SmallText>{t('Transaction')}:</SmallText>
                <SmallText
                  color="blue.500"
                  fontWeight={500}
                  cursor="pointer"
                  noOfLines={1}
                  onClick={() => {
                    global.openExternal(
                      `https://scan.idena.io/transaction/${tx.hash}`
                    )
                  }}
                >
                  {tx.hash}
                </SmallText>
              </HStack>
            </WalletListTd>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

function WalletTxStatus({
  tx: {direction, isMining, typeName, wallet, receipt},
}) {
  const {t} = useTranslation()

  const accentColor = direction === 'Sent' ? 'red' : 'blue'

  return (
    <Stack isInline>
      <Center
        bg={isMining ? 'muted' : `${accentColor}.012`}
        color={isMining ? 'muted' : `${accentColor}.500`}
        borderRadius="lg"
        p="1.5"
      >
        {direction === 'Sent' ? (
          <ArrowUpIcon boxSize="5" />
        ) : (
          <ArrowDownIcon boxSize="5" />
        )}
      </Center>
      <Box>
        <Text color="gray.500" fontWeight={500}>
          {typeName}
        </Text>
        <SmallText fontWeight={500}>{wallet?.name}</SmallText>
        <Box fontWeight={500}>
          {isMining ? (
            <SmallText color="orange.500" fontWeight={500}>
              {t('Mining...')}
            </SmallText>
          ) : (
            <HStack spacing="1" align="center">
              {receipt?.error && (
                <Tooltip
                  label={`${t('Smart contract failed')}: ${receipt?.error}`}
                >
                  <Icon name="exclamation-mark" color="red.500" w="5" h="5" />
                </Tooltip>
              )}
            </HStack>
          )}
        </Box>
      </Box>
    </Stack>
  )
}
