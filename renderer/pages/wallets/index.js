import React, {useEffect} from 'react'
import {rem} from 'polished'
import {FiChevronRight} from 'react-icons/fi'
import {useTranslation} from 'react-i18next'

import theme from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Box, Drawer, PageTitle} from '../../shared/components'
import Flex from '../../shared/components/flex'
import Actions from '../../shared/components/actions'
import IconLink from '../../shared/components/icon-link'

import TotalAmount from '../../screens/wallets/components/total-amount'
import WalletList from '../../screens/wallets/components/wallet-list'
import WalletActions from '../../screens/wallets/components/wallet-actions'
import TransferForm from '../../screens/wallets/components/transfer-form'
import ReceiveForm from '../../screens/wallets/components/receive-form'

import KillForm from '../../screens/wallets/components/kill-form'

import Loading from '../../shared/components/loading'
import useWallets from '../../shared/utils/useWallets'
import {useChainState} from '../../shared/providers/chain-context'
import {FlatButton} from '../../shared/components/button'

export default function Index() {
  const {t} = useTranslation()
  const {wallets, totalAmount, fetching} = useWallets()

  const [isReceiveFormOpen, setIsReceiveFormOpen] = React.useState(false)
  const [isTransferFormOpen, setIsTransferFormOpen] = React.useState(false)
  const [isWithdrawStakeFormOpen, setIsWithdrawStakeFormOpen] = React.useState(
    false
  )
  const handleCloseWithdrawStakeForm = () => setIsWithdrawStakeFormOpen(false)
  const handleCloseTransferForm = () => setIsTransferFormOpen(false)
  const handleCloseReceiveForm = () => setIsReceiveFormOpen(false)

  const [activeWallet, setActiveWallet] = React.useState()
  const {syncing, offline} = useChainState()

  useEffect(() => {
    if (!activeWallet && wallets && wallets.length > 0) {
      setActiveWallet(wallets[0])
    }
  }, [activeWallet, wallets])

  return (
    <Layout syncing={syncing} offline={offline}>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <PageTitle>{t('Wallets')}</PageTitle>
        <Box>
          {fetching ? (
            <Loading color={theme.colors.text} />
          ) : (
            <>
              <Flex css={{justifyContent: 'space-between', marginBottom: 24}}>
                <div>
                  <TotalAmount
                    amount={totalAmount}
                    percentChanges={0}
                    amountChanges={0}
                  />
                </div>
                <div>
                  <Actions>
                    <IconLink
                      disabled={activeWallet && activeWallet.isStake}
                      icon={<i className="icon icon--withdraw" />}
                      onClick={() => {
                        setIsTransferFormOpen(!isTransferFormOpen)
                      }}
                    >
                      {t('Send')}
                    </IconLink>
                    <IconLink
                      disabled={activeWallet && activeWallet.isStake}
                      icon={<i className="icon icon--deposit" />}
                      onClick={() => {
                        setIsReceiveFormOpen(!isReceiveFormOpen)
                      }}
                    >
                      {t('Receive')}
                    </IconLink>
                  </Actions>
                </div>
              </Flex>
              <div>
                <WalletList
                  wallets={wallets}
                  activeWallet={activeWallet}
                  onChangeActiveWallet={wallet => setActiveWallet(wallet)}
                  onSend={() => setIsTransferFormOpen(true)}
                  onReceive={() => setIsReceiveFormOpen(true)}
                  onWithdrawStake={() => setIsWithdrawStakeFormOpen(true)}
                />
              </div>
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: rem(24),
                  letterSpacing: 0,
                  marginBottom: 0,
                  marginTop: 0,
                  color: theme.colors.primary2,
                }}
              >
                {t('Recent transactions')}
              </h3>

              <FlatButton
                color={theme.colors.primary}
                onClick={() =>
                  global.openExternal(
                    `https://scan.idena.io/address?address=${activeWallet.address}#rewards`
                  )
                }
                style={{
                  marginBottom: rem(19),
                }}
              >
                <span>{t('See Explorer for rewards and penalties')} </span>

                <FiChevronRight
                  style={{
                    position: 'relative',
                    top: '3px',
                  }}
                  fontSize={rem(19)}
                />
              </FlatButton>

              <WalletActions />
            </>
          )}
        </Box>
        <Drawer show={isTransferFormOpen} onHide={handleCloseTransferForm}>
          <TransferForm
            onSuccess={handleCloseTransferForm}
            onFail={handleCloseTransferForm}
          />
        </Drawer>

        <Drawer show={isReceiveFormOpen} onHide={handleCloseReceiveForm}>
          <ReceiveForm address={wallets[0] && wallets[0].address} />
        </Drawer>

        <Drawer
          show={isWithdrawStakeFormOpen}
          onHide={handleCloseWithdrawStakeForm}
        >
          <KillForm
            onSuccess={handleCloseWithdrawStakeForm}
            onFail={handleCloseWithdrawStakeForm}
          />
        </Drawer>
      </Box>
    </Layout>
  )
}
