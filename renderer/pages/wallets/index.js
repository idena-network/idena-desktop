import React, {useState, useEffect} from 'react'
import {rem} from 'polished'
import theme from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Box, Drawer, Heading} from '../../shared/components'

import Flex from '../../shared/components/flex'
import Actions from '../../shared/components/actions'
import IconLink from '../../shared/components/icon-link'
import TotalAmount from '../../screens/wallets/components/total-amount'
import WalletList from '../../screens/wallets/components/wallet-list'
import WalletActions from '../../screens/wallets/components/wallet-actions'
import TransferForm from '../../screens/wallets/components/transfer-form'
import Loading from '../../shared/components/loading'
import {fetchAccountList, fetchBalance} from '../../shared/api/wallet'
import {useIdentityState} from '../../shared/providers/identity-context'

export default function Index() {
  const [wallets, setWallets] = useState()
  const [totalAmount, setTotalAmount] = useState()

  const [fetching, setFetching] = useState(false)
  const [isTransferFormOpen, setIsTransferFormOpen] = React.useState(false)
  const handleCloseTransferForm = () => setIsTransferFormOpen(false)
  const {address} = useIdentityState()

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const accounts = await fetchAccountList(address)
      /*
      const nextWallets = await Promise.all(
        accounts
          .map(account => ({
            address: account.address,
            isStake: account.isStake,
          }))
          .map(fetchBalance)
      )

        const balancePromises = accounts.map(account => {
        const {result} = fetchBalance(account.address, account.isStake)
        alert(JSON.stringify({result}))
        return {...account, balance: result}
      })
      const nextWallets = await Promise.all(balancePromises)

  */
      /*
      const nextWallets = await Promise.all(
        accounts.map(account => {
          const result = fetchBalance(account.address, account.isStake)
          alert(JSON.stringify(result))
          return { ...account, balance: 12 }
        })
      )

      
      const balancePromises = accounts.map(account =>
        fetchBalance.then(resp => ({account, ...resp}))
      )
  */

      const balancePromises = accounts.map(account =>
        fetchBalance(account.address).then(resp => {
          const balance =
            resp && account && (account.isStake ? resp.stake : resp.balance)
          return {...account, balance}
        })
      )

      const nextWallets = await Promise.all(balancePromises)

      // console.log(JSON.stringify(nextWallets))
      setWallets(nextWallets)
      setTotalAmount(
        nextWallets.map(b => b.balance).reduce((a, b) => a * 1 + b * 1, 0)
      )
    }

    if (!ignore) {
      setFetching(true)
      fetchData()
      setFetching(false)
    }

    return () => {
      ignore = true
    }
  }, [address])

  return (
    <Layout>
      <Box px={theme.spacings.xxxlarge} py={theme.spacings.large}>
        <Heading>Wallets</Heading>
        <Box>
          {fetching ? (
            <Loading color={theme.colors.text} />
          ) : (
            <>
              <Flex css={{justifyContent: 'space-between', marginBottom: 24}}>
                <div>
                  <TotalAmount
                    amount={totalAmount}
                    percentChanges={-0.48}
                    amountChanges={-122}
                  />
                </div>
                <div>
                  <Actions>
                    <IconLink
                      icon={<i className="icon icon--withdraw" />}
                      onClick={() => {
                        setIsTransferFormOpen(!isTransferFormOpen)
                      }}
                    >
                      Transfer
                    </IconLink>
                    <IconLink icon={<i className="icon icon--deposit" />}>
                      Receive
                    </IconLink>
                    {/*
                      <IconLink icon={<i className="icon icon--add_btn" />}>
                          New wallet
                      </IconLink>
                    */}
                  </Actions>
                </div>
              </Flex>
              <div>
                <WalletList wallets={wallets} />
              </div>
              <h3
                style={{
                  fontWeight: 500,
                  fontSize: rem(24),
                  letterSpacing: 0,
                  marginBottom: rem(19),
                  marginTop: 0,
                  color: theme.colors.primary2,
                }}
              >
                Recent transactions
              </h3>

              <WalletActions />
            </>
          )}
        </Box>
        <Drawer show={isTransferFormOpen} onHide={handleCloseTransferForm}>
          <TransferForm wallets={wallets} />
        </Drawer>
      </Box>
    </Layout>
  )
}
