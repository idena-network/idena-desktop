import {useEffect, useState} from 'react'
import {fetchCoinbaseAddress} from '../api'

function useAddress() {
  const [coinbaseAddress, setCoinbaseAddress] = useState()
  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const address = await fetchCoinbaseAddress()
      if (!ignore) {
        setCoinbaseAddress(address)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  return coinbaseAddress
}

export default useAddress
