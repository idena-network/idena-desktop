import React, {useEffect, useState} from 'react'
import {decode} from 'rlp'
import Layout from '../../components/layout'
import {Heading} from '../../shared/components'
import FlipToolbar from './components/toolbar'
import FlipList from './components/flip-list'
import {fromHexString} from '../../shared/utils/string'
import {fetchFlip} from '../../shared/services/api'

const FLIPS_STORAGE_KEY = 'idena-flips'
const FLIP_DRAFTS_STORAGE_KEY = 'idena/flips/drafts'

function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || []
}

export default function() {
  const [flips, setFlips] = useState({flips: [], drafts: []})
  const [filter, setFilter] = useState('flips')

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const hashes = getFromLocalStorage(FLIPS_STORAGE_KEY)
      const responses = await Promise.all(hashes.map(hash => fetchFlip(hash)))

      const fetchedFlips = responses.map(({result}) =>
        result ? decode(fromHexString(result.hex.substr(2)))[0] : []
      )

      if (!ignore) {
        setFlips({...flips, flips: fetchedFlips})
      }
    }

    if (filter === 'drafts') {
      const drafts = getFromLocalStorage(FLIP_DRAFTS_STORAGE_KEY)
      setFlips({...flips, drafts})
    } else {
      fetchData()
    }

    return () => {
      ignore = true
    }
  }, [filter])

  return (
    <Layout>
      <Heading>My Flips</Heading>
      <FlipToolbar activeFilter={filter} onFilter={setFilter} />
      <FlipList flips={flips[filter]} />
    </Layout>
  )
}
