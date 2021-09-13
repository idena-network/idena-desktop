import React from 'react'
import {useTranslation} from 'react-i18next'
import {Flex, Stack, Box, Heading, Icon, useDisclosure} from '@chakra-ui/core'
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
  ReceiveDnaDrawer,
  SendDnaDrawer,
  TotalAmount,
  WalletCard,
  WalletTransactionList,
} from '../screens/wallets/containers'
import {useFailToast, useSuccessToast} from '../shared/hooks/use-toast'
import {useIdentityState} from '../shared/providers/identity-context'
import {areSameCaseInsensitive} from '../screens/oracles/utils'
import {FillPlaceholder} from '../screens/oracles/components'

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
        <Stack spacing={8} w="full">
          <Flex justify="space-between" align="flex-start">
            <Box pt="1/2" pb={2}>
              <TotalAmount address={address} amount={totalAmount} />
            </Box>
            <Stack isInline spacing={1} align="center" pt={2}>
              <VDivider />
              <IconButton2
                icon={<Icon name="send-out" size={5} transform="scaleX(-1)" />}
                onClick={onOpenSendDnaDrawer}
              >
                {t('Send')}
              </IconButton2>
              <VDivider />
              <IconButton2 icon="send-out" onClick={onOpenReceiveDnaDrawer}>
                {t('Receive')}
              </IconButton2>
            </Stack>
          </Flex>
          <Stack isInline spacing={6}>
            {wallets.map(wallet => (
              <WalletCard
                key={wallet.address + wallet.name}
                wallet={wallet}
                isSelected={areSameCaseInsensitive(wallet.name, 'main')}
                onSend={onOpenSendDnaDrawer}
                onReceive={onOpenReceiveDnaDrawer}
              />
            ))}
          </Stack>
          <Stack spacing={4}>
            <Stack spacing="1px" mb={5}>
              <Heading
                as="h2"
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
            </Stack>
            <Box>
              <WalletTransactionList txs={txs} />
              {txs?.length === 0 && (
                <FillPlaceholder mt={24}>
                  {t(`You don't have any transactions yet`)}
                </FillPlaceholder>
              )}
            </Box>
          </Stack>
        </Stack>

        <SendDnaDrawer
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

        <ReceiveDnaDrawer
          address={address}
          isOpen={isOpenReceiveDnaDrawer}
          onClose={onCloseReceiveDnaDrawer}
        />
      </Page>
    </Layout>
  )
}
