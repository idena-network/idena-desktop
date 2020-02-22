import {useState, useEffect, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import * as api from '../api/dna'
import {useInterval} from '../hooks/use-interval'
import {HASH_IN_MEMPOOL} from './tx'
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

function getTransactionTypeName(tx) {
  const {type} = tx
  const {payload} = tx
  if (type === 'send') return 'Transfer'
  if (type === 'activation') return 'Invitation activated'
  if (type === 'invite') return 'Invitation issued'
  if (type === 'killInvitee') return 'Invitation terminated'
  if (type === 'kill') return 'Identity terminated'
  if (type === 'submitFlip') return 'Flip submitted'
  if (type === 'online')
    return `Mining status ${payload === '0xc101' ? 'On' : 'Off'}`
  return ''
}

function useWallets() {
  const {t} = useTranslation()
  const [wallets, setWallets] = useState([])
  const [totalAmount, setTotalAmount] = useState()
  const {address} = useIdentityState()
  const [fetching, setFetching] = useState(false)

  const [transactions, setTransactions] = useState([])
  const [txFetching, setTxFetching] = useState(true)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const accounts = await fetchAccountList(address)
      const balancePromises = accounts.map(account =>
        fetchBalance(account.address).then(resp => {
          const walletBalance =
            resp && account && (account.isStake ? resp.stake : resp.balance)

          return {
            ...account,
            balance: walletBalance,
            name: account.isStake ? t('Stake') : t('Main'),
          }
        })
      )

      const nextWallets = await Promise.all(balancePromises)

      const nextTotalAmount =
        nextWallets.length &&
        nextWallets
          .map(b => b.balance)
          .reduce((a, b) => parseFloat(a) + parseFloat(b) || 0)

      setWallets(nextWallets)
      setTotalAmount(nextTotalAmount)
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
      const balancePromises = wallets.map(wallet =>
        fetchBalance(wallet.address).then(resp => {
          const walletBalance =
            resp && wallet && (wallet.isStake ? resp.stake : resp.balance)

          return {
            ...wallet,
            balance: walletBalance,
          }
        })
      )

      const nextWallets = await Promise.all(balancePromises)
      const nextTotalAmount =
        nextWallets.length &&
        nextWallets
          .map(b => b.balance)
          .reduce((a, b) => parseFloat(a) + parseFloat(b) || 0)

      setWallets(nextWallets)
      setTotalAmount(nextTotalAmount)
    }

    if (!ignore) {
      setTxFetching(true)
      fetchData()
      setTxFetching(false)
    }

    return () => {
      ignore = true
    }
  }, 2000)

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

      const hiddenTypes = [
        'evidence',
        'submitShortAnswers',
        'submitLongAnswers',
        'submitAnswersHash',
      ]

      const nextTransactions =
        joinedTxs &&
        joinedTxs
          .filter(tx => tx && !hiddenTypes.find(type => tx.type === type))
          .map(tx => {
            const fromWallet = wallets.find(
              wallet => wallet.address === tx.from
            )
            const toWallet = wallets.find(wallet => wallet.address === tx.to)

            const direction = fromWallet ? 'Sent' : 'Received'

            const typeName =
              tx.type === 'send' ? direction : getTransactionTypeName(tx)

            const sourceWallet = fromWallet || toWallet
            const signAmount = fromWallet ? -tx.amount : `+${tx.amount}`
            const counterParty = fromWallet ? tx.to : tx.from
            const counterPartyWallet = fromWallet ? toWallet : fromWallet
            const isMining = tx.blockHash === HASH_IN_MEMPOOL

            const nextTx = {
              ...tx,
              typeName,
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
  }, 2000)

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
    txFetching,
  }
}

export default useWallets
