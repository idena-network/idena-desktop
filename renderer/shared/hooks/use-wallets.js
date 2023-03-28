import {useEffect, useCallback, useReducer} from 'react'
import * as api from '../api/dna'
import {useInterval} from './use-interval'
import {HASH_IN_MEMPOOL} from '../utils/utils'
import {useIdentityState} from '../providers/identity-context'
import {
  fetchAccountList,
  fetchBalance,
  fetchTransactions,
  fetchPendingTransactions,
  fetchTransactionReceipt,
} from '../api/wallet'

function isAddress(address) {
  return address.length === 42 && address.substr(0, 2) === '0x'
}

function transactionType(tx) {
  const {type, receipt, payload} = tx
  if (type === 'send') return 'Transfer'
  if (type === 'activation') return 'Invitation activated'
  if (type === 'invite') return 'Invitation issued'
  if (type === 'killInvitee') return 'Invitation terminated'
  if (type === 'kill') return 'Identity terminated'
  if (type === 'submitFlip') return 'Flip submitted'
  if (type === 'online')
    return `Mining status ${payload === '0x' ? 'Off' : 'On'}`

  if (type === 'deployContract') return 'Deploy'
  if (type === 'terminateContract') return 'Terminate'
  if (type === 'callContract') {
    const method = receipt ? receipt.method : 'unknown'
    if (method === 'sendVote') return 'Send public vote'
    if (method === 'sendVoteProof') return 'Send secret vote'
    if (method === 'startVoting') return 'Start voting'
    if (method === 'finishVoting') return 'Finish voting'
    if (method === 'prolongVoting') return 'Prolong voting'
    if (method === 'startVoting') return 'Start voting'

    return `Call ${method}`
  }

  if (type === 'replenishStake') return 'Replenish stake'
  return type
}

async function fetchWallets(address) {
  const accounts = await fetchAccountList(address)
  return Promise.all(
    accounts.map((account) =>
      fetchBalance(account.address).then((resp) => ({
        ...account,
        balance: resp && (account.isStake ? resp.stake : resp.balance),
        name: account.isStake ? 'Stake' : 'Main',
      }))
    )
  )
}

async function fetchTxs({address, wallets}) {
  const txResp = await fetchTransactions(address, 50)
  const txPendingResp = await fetchPendingTransactions(address, 50)

  const txsResp = txResp && txResp.result && txResp.result.transactions

  const hasReceipt = ['callContract', 'deployContract', 'terminateContract']

  const txs = !txsResp
    ? []
    : await Promise.all(
        txsResp.map((tx) => {
          if (hasReceipt.find((type) => tx.type === type))
            return fetchTransactionReceipt(tx.hash).then((resp) => {
              const receipt = resp && resp.result
              const nextTx = {
                ...tx,
                receipt,
              }
              return nextTx
            })
          return tx
        })
      )
  const txsPending =
    txPendingResp && txPendingResp.result && txPendingResp.result.transactions

  const joinedTxs = [].concat(txsPending).concat(txs)

  const hiddenTypes = [
    'evidence',
    'submitShortAnswers',
    'submitLongAnswers',
    'submitAnswersHash',
  ]

  return joinedTxs
    .filter((tx) => tx && !hiddenTypes.find((type) => tx.type === type))
    .map((tx) => {
      const fromWallet = wallets.find((wallet) => wallet.address === tx.from)
      const toWallet = wallets.find((wallet) => wallet.address === tx.to)

      const direction = fromWallet ? 'Sent' : 'Received'

      const typeName = tx.type === 'send' ? direction : transactionType(tx)

      const sourceWallet = fromWallet || toWallet
      const signAmount = fromWallet ? -tx.amount : `+${tx.amount}`

      const contractAddress = tx.receipt && tx.receipt.contract
      const toAddress = tx.to ? tx.to : contractAddress

      const counterParty = fromWallet ? toAddress : tx.from
      const counterPartyWallet = fromWallet ? toWallet : fromWallet
      const isMining = tx.blockHash === HASH_IN_MEMPOOL

      const nextTx = {
        ...tx,
        to: tx.to ? tx.to : contractAddress,
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
}

async function fetchData(address) {
  const wallets = await fetchWallets(address)
  const txs = await fetchTxs({address, wallets})
  return {wallets, txs}
}

function totalBalance(wallets) {
  return wallets.reduce((acc, curr) => acc + parseFloat(curr.balance), 0)
}

export function useWallets() {
  const {address} = useIdentityState()

  const [state, dispatch] = useReducer(
    // eslint-disable-next-line no-shadow
    (state, {type, ...data}) => {
      switch (type) {
        case 'FETCH':
          return {...state, status: 'fetching', ...data}
        case 'POLL':
          return {...state, status: 'polling', ...data}
        case 'RESOLVE': {
          const {wallets, txs} = data
          return {
            ...state,
            status: 'success',
            wallets,
            totalAmount: totalBalance(wallets),
            txs,
          }
        }
        case 'REJECT':
          return {...state, status: 'fail', error: data.error}
        default:
          return state
      }
    },
    {
      wallets: [],
      totalAmount: null,
      transactions: [],
      status: 'idle',
      error: null,
    }
  )

  useEffect(() => {
    if (['fetching', 'polling'].includes(state.status)) {
      let canceled = false

      fetchData(address)
        .then(({wallets, txs}) => {
          if (canceled) return
          dispatch({type: 'RESOLVE', wallets, txs})
        })
        .catch((error) => {
          if (canceled) return
          dispatch({type: 'REJECT', error})
        })

      return () => {
        canceled = true
      }
    }
  }, [address, state.status])

  useEffect(() => {
    if (address) dispatch({type: 'FETCH'})
  }, [address])

  useInterval(
    () => {
      dispatch({type: 'POLL'})
    },
    address ? 1000 * 5 : null
  )

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
    ...state,
    sendTransaction,
  }
}
