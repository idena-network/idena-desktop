import {useEffect, useState} from 'react'
import {fetchIdentity} from '../api'

const initialIdentity = {
  address: '',
  nickname: '',
  stake: '',
  invites: 0,
  age: 0,
  state: '',
  pubkey: '',
  requiredFlips: 0,
  madeFlips: 0,
  totalQualifiedFlips: 0,
  totalShortFlipPoints: 0,
  flips: null,
  online: false,
}

function useIdentity(address) {
  const [identity, setIdentity] = useState(initialIdentity)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      // eslint-disable-next-line no-shadow
      const identity = await fetchIdentity(address)
      if (!ignore) {
        setIdentity(identity)
      }
    }

    if (address) {
      fetchData()
    }

    return () => {
      ignore = true
    }
  }, [address])

  return identity
}

export default useIdentity
