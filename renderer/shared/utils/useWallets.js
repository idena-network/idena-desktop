import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import * as api from '../api/dna'
import {useInterval} from '../hooks/use-interval'
import {fetchTx} from '../api'
import {HASH_IN_MEMPOOL} from './tx'
import {areSame, areEual} from './arr'

import {useIdentityState} from '../providers/identity-context'
import {
  fetchAccountList,
  fetchBalance,
  fetchTransactions,
  fetchPendingTransactions,
} from '../api/wallet'

function isAddress(address) {
  return address.length === 42 && address.substr(0, 2) === '0x'
}

function useWallets() {
  const [wallets, setWallets] = useState([])
  const [totalAmount, setTotalAmount] = useState()
  const {address} = useIdentityState()
  const [fetching, setFetching] = useState(false)

  const [transactions, setTransactions] = useState([])
  const [txFetching, setTxFetching] = useState(false)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const accounts = await fetchAccountList(address)
      const balancePromises = accounts.map(account =>
        fetchBalance(account.address).then(resp => {
          const balance =
            resp && account && (account.isStake ? resp.stake : resp.balance)
          return {...account, balance, name: account.isStake ? 'Stake' : 'Main'}
        })
      )

      const nextWallets = await Promise.all(balancePromises)

      setWallets(nextWallets)
      setTotalAmount(
        nextWallets.map(b => b.balance).reduce((a, b) => a * 1 + b * 1 || 0)
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

  useInterval(() => {
    let ignore = false

    async function fetchData() {
      const txResp = await fetchTransactions(address, 50)
      const txPendingResp = await fetchPendingTransactions(address, 50)

      const txs = txResp && txResp.result && txResp.result.transactions
      const txsPending =
        txPendingResp &&
        txPendingResp.result &&
        txPendingResp.result.transactions

      const joinedTxs = [].concat(txsPending).concat(txs)
      // alert(txs.length)
      // if (txsPending && txsPending.length > 0) alert(txsPending.length)

      const nextTransactions =
        joinedTxs &&
        joinedTxs
          .filter(tx => tx)
          .map(tx => {
            const fromWallet = wallets.find(
              wallet => wallet.address === tx.from
            )
            const toWallet = wallets.find(wallet => wallet.address === tx.to)

            const direction = fromWallet ? 'Sent' : 'Received'
            const sourceWallet = fromWallet || toWallet
            const signAmount = fromWallet ? -tx.amount : tx.amount
            const counterParty = fromWallet ? tx.to : tx.from
            const counterPartyWallet = fromWallet ? toWallet : fromWallet
            const isMining = tx.blockHash === HASH_IN_MEMPOOL

            const nextTx = {
              ...tx,
              wallet: sourceWallet,
              direction,
              signAmount,
              counterParty,
              counterPartyWallet,
              isMining,
            }
            return nextTx
          })

      setTransactions(nextTransactions)
    }

    if (!ignore) {
      setTxFetching(true)
      fetchData()
      setTxFetching(false)
    }

    return () => {
      ignore = true
    }
  }, [address, wallets])

  const sendTransaction = useCallback(async ({from, to, amount}) => {
    if (!isAddress(from)) {
      return {
        error: {message: `Incorrect 'From' address: ${from}`},
      }
    }
    if (!isAddress(to)) {
      return {
        error: {message: `Incorrect 'To' address: ${to}`},
      }
    }
    if (amount <= 0) {
      return {
        error: {message: `Incorrect Amount: ${amount}`},
      }
    }

    const resp = await api.sendTransaction(from, to, amount)
    const {result} = resp

    if (!result) {
      const {error} = resp
      throw new Error(error.message)
    }
    return resp
  }, [])

  return {
    wallets,
    totalAmount,
    fetching,
    sendTransaction,
    transactions,
  }
}

export default useWallets
