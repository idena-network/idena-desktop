import React, {useEffect, useState} from 'react'
import {decode} from 'rlp'
import Layout from '../../components/layout'
import {Heading, Box} from '../../shared/components'
import FlipToolbar from './components/toolbar'
import FlipList from './components/flip-list'
import {fromHexString} from '../../shared/utils/string'
import {fetchFlip} from '../../shared/services/api'
import {
  getFromLocalStorage,
  FLIPS_STORAGE_KEY,
  FLIP_DRAFTS_STORAGE_KEY,
} from './utils/storage'
import theme from '../../shared/theme'

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
      <Box p={theme.spacings.xlarge}>
        <Heading margin={`0 0 ${theme.spacings.normal}`}>My Flips</Heading>
        <Box css={{marginBottom: theme.spacings.normal}}>
          <FlipToolbar activeFilter={filter} onFilter={setFilter} />
        </Box>
        <FlipList flips={flips[filter]} />
      </Box>
    </Layout>
  )
}
