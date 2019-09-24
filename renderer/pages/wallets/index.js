import React, {useState, useEffect} from 'react'
import {FiUploadCloud, FiPlusSquare} from 'react-icons/fi'
import {rem} from 'polished'
import theme from '../../shared/theme'
import Layout from '../../shared/components/layout'
import {Box, Heading} from '../../shared/components'
import {
  Table,
  TableCol,
  TableRow,
  TableHeaderCol,
  RowStatus,
} from '../../shared/components/table'
import Flex from '../../shared/components/flex'
import Actions from '../../shared/components/actions'
import IconLink from '../../shared/components/icon-link'
import TotalAmount from '../../screens/wallets/components/total-amount'
import WalletList from '../../screens/wallets/components/wallet-list'
import Loading from '../../shared/components/loading'
import {fetchAccountList, fetchBalance} from '../../shared/api/wallet'

export default function Index() {
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
                    <IconLink icon={<FiPlusSquare />}>New wallet</IconLink>
                    <IconLink icon={<FiUploadCloud />}>Receive</IconLink>
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

              <Table>
                <thead>
                  <TableRow>
                    <TableHeaderCol>Transaction</TableHeaderCol>
                    <TableHeaderCol>Date</TableHeaderCol>
                    <TableHeaderCol>USD value</TableHeaderCol>
                    <TableHeaderCol>DNA value</TableHeaderCol>
                  </TableRow>
                </thead>
                <tbody>
                  <TableRow>
                    <TableCol>
                      <RowStatus up walletName="Main" />
                    </TableCol>
                    <TableCol>24.03.2019, 16:42</TableCol>
                    <TableCol>2,9914 USD</TableCol>
                    <TableCol color={theme.colors.danger}>-200 DNA</TableCol>
                  </TableRow>
                </tbody>
              </Table>
            </>
          )}
        </Box>
      </Box>
    </Layout>
  )
}
