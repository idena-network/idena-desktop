/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Button,
  Flex,
  Icon,
  PseudoBox,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useClipboard,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import QrCode from 'qrcode.react'
import {PrimaryButton} from '../../shared/components/button'
import {
  Avatar,
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
  WalletCardMenuItemIcon,
  WalletDrawer,
  WalletDrawerForm,
  WalletDrawerFormControl,
  WalletDrawerHeader,
  WalletDrawerHeaderIcon,
  WalletDrawerHeaderIconBox,
} from './components'
import {callRpc, toLocaleDna} from '../../shared/utils/utils'
import {
  Table,
  TableCol,
  TableHeaderCol,
  TableRow,
} from '../../shared/components'

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
      p={4}
      pl={5}
      h={32}
      w={56}
      position="relative"
      {...props}
    >
      <Stack spacing={1}>
        <Flex justify="space-between" align="center">
          <Box fontWeight={500}>{name}</Box>
          {isStake ? (
            <Icon name="lock" size={4} color="muted" />
          ) : (
            <WalletCardMenu>
              <WalletCardMenuItem onClick={onSend}>
                <WalletCardMenuItemIcon
                  name="send-out"
                  transform="scaleX(-1)"
                />
                {t('Send')}
              </WalletCardMenuItem>
              <WalletCardMenuItem onClick={onReceive}>
                <WalletCardMenuItemIcon name="send-out" />
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
        <PseudoBox
          position="absolute"
          left={-4}
          top={-4}
          right={-4}
          bottom={-4}
          borderColor="blue.500"
          borderWidth={2}
          borderRadius="xl"
          zIndex="hide"
          _before={{
            content: `""`,
            position: 'absolute',
            left: '-6px',
            top: '-6px',
            right: '-6px',
            bottom: '-6px',
            borderColor: 'blue.025',
            borderWidth: 4,
            borderRadius: 16,
          }}
        />
      )}
    </Flex>
  )
}

export function SendDnaDrawer({address, onSend, onFail, ...props}) {
  const {t} = useTranslation()

  const [isSubmitting, setIsSubmitting] = React.useState()

  return (
    <WalletDrawer {...props}>
      <WalletDrawerHeader title={t('Send iDNA')}>
        <WalletDrawerHeaderIconBox color="red">
          <WalletDrawerHeaderIcon
            name="send-out"
            color="red"
            transform="scaleX(-1)"
          />
        </WalletDrawerHeaderIconBox>
      </WalletDrawerHeader>
      <WalletDrawerForm
        onSubmit={async e => {
          e.preventDefault()

          const {
            from: {value: from},
            to: {value: to},
            amount: {value: amount},
          } = e.target.elements

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
        <DrawerBody>
          <Stack spacing={6}>
            <WalletDrawerFormControl label={t('From')}>
              <Input id="from" value={address} isDisabled />
            </WalletDrawerFormControl>
            <WalletDrawerFormControl label={t('To')}>
              <Input id="to" placeholder={t('Enter address')} />
            </WalletDrawerFormControl>
            <WalletDrawerFormControl label={t('Amount, iDNA')} id="amount">
              <Input id="amount" placeholder={t('Enter amount')} />
            </WalletDrawerFormControl>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <PrimaryButton isLoading={isSubmitting} loadingText={t('Sending')}>
            {t('Send')}
          </PrimaryButton>
        </DrawerFooter>
      </WalletDrawerForm>
    </WalletDrawer>
  )
}

export function ReceiveDnaDrawer({address, ...props}) {
  const {t} = useTranslation()

  const {onCopy} = useClipboard(address)

  return (
    <WalletDrawer
      title={t('Receive iDNA')}
      icon="send-out"
      color="blue"
      {...props}
    >
      <DrawerBody mt={5}>
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
                variantColor="blue"
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
    </WalletDrawer>
  )
}

export function WalletTransactionList({txs = []}) {
  const {t} = useTranslation(['translation', 'error'])
  return (
    <Table>
      <thead>
        <TableRow>
          <TableHeaderCol
            style={{
              minWidth: '130px',
            }}
          >
            {t('Transaction')}
          </TableHeaderCol>
          <TableHeaderCol>{t('Address')}</TableHeaderCol>
          <TableHeaderCol className="text-right">
            {t('Amount, iDNA')}
          </TableHeaderCol>
          <TableHeaderCol className="text-right">
            {t('Fee, iDNA')}
          </TableHeaderCol>
          <TableHeaderCol>{t('Date')}</TableHeaderCol>
          <TableHeaderCol>{t('Blockchain transaction ID')}</TableHeaderCol>
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
                <Stack isInline spacing={3} align="center">
                  <Avatar
                    address={tx.counterParty}
                    size={8}
                    bg="white"
                    borderColor="brandGray.016"
                    borderWidth={1}
                  />
                  <Box>
                    <Text fontWeight={500} whiteSpace="nowrap">
                      {tx.direction === 'Sent' ? t('To') : t('From')}{' '}
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {tx.counterPartyWallet
                        ? `${t('wallet')} ${tx.counterPartyWallet.name}`
                        : tx.receipt
                        ? t('smart contract')
                        : t('address')}
                    </Text>
                    <SmallText fontWeight={500}>{tx.counterParty}</SmallText>
                  </Box>
                </Stack>
              )}
            </TableCol>

            <TableCol className="text-right">
              <Box
                fontWeight={500}
                color={tx.signAmount < 0 ? 'red.500' : 'brandGray.500'}
              >
                {(tx.type === 'kill' && t('See in Explorer...')) ||
                  (tx.amount === '0' ? '\u2013' : tx.signAmount)}
              </Box>
            </TableCol>

            <TableCol className="text-right">
              {((!tx.isMining || tx.maxFee === '0') &&
                (tx.usedFee === '0' ? '\u2013' : tx.usedFee)) || (
                <Box>
                  <Box>{tx.maxFee}</Box>
                  <SmallText as="span" fontWeight={500}>
                    {t('Fee limit')}
                  </SmallText>
                </Box>
              )}
            </TableCol>
            <TableCol>
              <Text as="span" fontWeight={500}>
                {!tx.timestamp
                  ? '\u2013'
                  : new Date(tx.timestamp * 1000).toLocaleString()}
              </Text>
            </TableCol>
            <TableCol>
              {tx.isMining ? (
                t('Mining...')
              ) : (
                <Box fontWeight={500}>
                  <Stack isInline spacing={1} align="center">
                    {tx.receipt?.error && (
                      <Tooltip
                        label={`${t('Smart contract failed')}: ${
                          tx.receipt?.error
                        }`}
                      >
                        <Icon
                          name="exclamation-mark"
                          color="red.500"
                          size={5}
                        />
                      </Tooltip>
                    )}
                    <Text as="span">{t('Confirmed')}</Text>
                  </Stack>
                  <Button
                    variant="link"
                    variantColor="brandBlue"
                    fontWeight={500}
                    fontSize="sm"
                    alignItems="center"
                    alignSelf="flex-start"
                    _hover={{background: 'transparent'}}
                    _focus={{
                      outline: 'none',
                    }}
                    onClick={() => {
                      global.openExternal(
                        `https://scan.idena.io/transaction/${tx.hash}`
                      )
                    }}
                  >
                    <Text as="span" w={40} isTruncated>
                      {tx.isMining ? '' : tx.hash}
                    </Text>
                    <Icon
                      name="chevron-down"
                      size={4}
                      transform="rotate(-90deg)"
                    />
                  </Button>
                </Box>
              )}
            </TableCol>
          </TableRow>
        ))}
      </tbody>
    </Table>
  )
}

function WalletTxStatus({tx: {direction, isMining, typeName, wallet}}) {
  const txColorAccent = direction === 'Sent' ? 'red' : 'blue'

  return (
    <Stack isInline>
      <Flex
        align="center"
        justify="center"
        bg={isMining ? 'muted' : `${txColorAccent}.012`}
        color={isMining ? 'muted' : `${txColorAccent}.500`}
        borderRadius="lg"
        minH={8}
        minW={8}
      >
        <Icon name={`arrow-${direction === 'Sent' ? 'up' : 'down'}`} size={5} />
      </Flex>
      <Box isTruncated>
        <Text color="brandGray.500" fontWeight={500}>
          {typeName}
        </Text>
        <Text color="blue.500" fontSize="sm" fontWeight={500} isTruncated>
          {wallet?.name}
        </Text>
      </Box>
    </Stack>
  )
}
