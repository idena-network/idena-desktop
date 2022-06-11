import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Flex,
  Stack,
  Box,
  Heading,
  useDisclosure,
  HStack,
  Center,
} from '@chakra-ui/react'
import {useWallets} from '../shared/hooks/use-wallets'
import {IconButton2} from '../shared/components/button'
import Layout from '../shared/components/layout'
import {useChainState} from '../shared/providers/chain-context'
import {
  ExternalLink,
  Page,
  PageTitle,
  VDivider,
} from '../shared/components/components'
import {
  ReceiveDrawer,
  SendDrawer,
  TotalAmount,
  WalletCard,
  WalletTransactionList,
} from '../screens/wallets/containers'
import {useFailToast, useSuccessToast} from '../shared/hooks/use-toast'
import {useIdentityState} from '../shared/providers/identity-context'
import {SendOutIcon} from '../shared/components/icons'

export default function WalletsPage() {
  const {t} = useTranslation(['translation', 'error'])

  const {syncing, offline} = useChainState()

  const {address} = useIdentityState()

  const {wallets, totalAmount, txs} = useWallets()

  const {
    isOpen: isOpenSendDnaDrawer,
    onOpen: onOpenSendDnaDrawer,
    onClose: onCloseSendDnaDrawer,
  } = useDisclosure()

  const {
    isOpen: isOpenReceiveDnaDrawer,
    onOpen: onOpenReceiveDnaDrawer,
    onClose: onCloseReceiveDnaDrawer,
  } = useDisclosure()

  const successToast = useSuccessToast()
  const failToast = useFailToast()

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page>
        <PageTitle>{t('Wallets')}</PageTitle>
        <Stack spacing="8" w="full">
          <Flex justify="space-between" align="flex-start">
            <Box py="1">
              <TotalAmount address={address} amount={totalAmount} />
            </Box>
            <HStack spacing="1" align="center" pt="1">
              <VDivider />
              <IconButton2
                icon={<SendOutIcon transform="scaleX(-1)" />}
                onClick={onOpenSendDnaDrawer}
              >
                {t('Send')}
              </IconButton2>
              <VDivider />
              <IconButton2
                icon={<SendOutIcon />}
                onClick={onOpenReceiveDnaDrawer}
              >
                {t('Receive')}
              </IconButton2>
            </HStack>
          </Flex>

          <HStack spacing="6">
            {wallets.map(wallet => (
              <WalletCard
                key={`${wallet.name}@${wallet.address}`}
                wallet={wallet}
                onSend={onOpenSendDnaDrawer}
                onReceive={onOpenReceiveDnaDrawer}
              />
            ))}
          </HStack>

          <Stack spacing="5">
            <Box pb="0.5">
              <Heading
                as="h2"
                color="gray.500"
                fontSize="lg"
                fontWeight={500}
                lineHeight="short"
              >
                {t('Recent transactions')}
              </Heading>
              <ExternalLink
                href={`https://scan.idena.io/address/${address}#rewards`}
              >
                {t('See Explorer for rewards and penalties')}
              </ExternalLink>
            </Box>
            <Box>
              {txs?.length > 0 ? (
                <WalletTransactionList txs={txs} />
              ) : (
                <Center mt="24" color="muted">
                  {t(`You don't have any transactions yet`)}
                </Center>
              )}
            </Box>
          </Stack>
        </Stack>

        <SendDrawer
          address={address}
          isOpen={isOpenSendDnaDrawer}
          onClose={onCloseSendDnaDrawer}
          onSend={hash => {
            onCloseSendDnaDrawer()
            successToast({
              title: t('Transaction sent'),
              description: hash,
            })
          }}
          onFail={error => {
            onCloseSendDnaDrawer()
            failToast({
              title: t('Error while sending transaction'),
              description: error,
            })
          }}
        />

        <ReceiveDrawer
          address={address}
          isOpen={isOpenReceiveDnaDrawer}
          onClose={onCloseReceiveDnaDrawer}
        />
      </Page>
    </Layout>
  )
}
