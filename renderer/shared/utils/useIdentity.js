import {useEffect, useState, useRef} from 'react'
import {fetchIdentity, fetchCoinbaseAddress} from '../api'

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
  const addressRef = useRef(address)

  const friendlyStatus =
    identity.state === 'Undefined' ? 'Not validated' : identity.state
  const validated = friendlyStatus === 'Validated'

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      if (!address) {
        addressRef.current = await fetchCoinbaseAddress()
      }

      // eslint-disable-next-line no-shadow
      const identity = await fetchIdentity(addressRef.current)
      if (!ignore) {
        setIdentity(identity)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [address, friendlyStatus])

  return {...identity, friendlyStatus, validated}
}

export default useIdentity
