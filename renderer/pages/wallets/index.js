import React, {useState, useEffect} from 'react'
import Layout from '../../components/layout'
import {Box, Heading} from '../../shared/components'
import theme from '../../shared/theme'
import TotalAmount from '../../screens/wallets/components/total-amount'
import {fetchAccountList} from '../../screens/wallets/shared/api/wallet-api'
import {fetchBalance} from '../../shared/services/api'
import WalletList from '../../screens/wallets/components/wallet-list'
import Loading from '../../shared/components/loading'

export default function() {
  const [wallets, setWallets] = useState()
  const [totalAmount, setTotalAmount] = useState()

  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const accounts = await fetchAccountList()

      const balancePromises = accounts.map(account =>
        fetchBalance.then(resp => ({account, ...resp}))
      )
      const nextWallets = await Promise.all(balancePromises)
      setWallets(nextWallets)
      setTotalAmount(nextWallets.map(b => b.balance).reduce((a, b) => a + b, 0))
    }

    if (!ignore) {
      setFetching(true)
      fetchData()
      setFetching(false)
    }

    return () => {
      ignore = true
    }
  }, [])

  return (
    <Layout>
      <Box p={theme.spacings.large}>
        <Heading>Wallets</Heading>
        <Box>
          {fetching ? (
            <Loading color={theme.colors.text} />
          ) : (
            <>
              <TotalAmount amount={totalAmount} />
              <WalletList wallets={wallets} />
            </>
          )}
        </Box>
      </Box>
    </Layout>
  )
}
