import {useState, useEffect, useCallback} from 'react'
import {encode} from 'rlp'
import * as api from '../api/dna'
import {useInterval} from '../hooks/use-interval'
import {fetchTx} from '../api'
import {HASH_IN_MEMPOOL} from './tx'
import {areSame, areEual} from './arr'

import {useIdentityState} from '../providers/identity-context'
import {fetchAccountList, fetchBalance} from '../api/wallet'

function isAddress(address) {
  return address.length === 42 && address.substr(0, 2) === '0x'
}

function useWallets() {
  const [wallets, setWallets] = useState([])
  const [totalAmount, setTotalAmount] = useState()
  const {address} = useIdentityState()
  const [fetching, setFetching] = useState(false)

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

  const sendTransaction = useCallback(async ({from, to, amount}) => {
    if (!isAddress(from)) {
      return {
        error: {message: `Incorrect From address: ${from}`},
      }
    }
    if (!isAddress(to)) {
      return {
        error: {message: `Incorrect To address: ${to}`},
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
  }
}

export default useWallets
