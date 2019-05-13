import React, {useEffect, useContext, useState} from 'react'
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
import NetContext from '../../shared/providers/net-provider'

export default function() {
  const [flips, setFlips] = useState({flips: [], drafts: []})
  const [filter, setFilter] = useState('flips')

  const {validationRunning} = useContext(NetContext)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const responses = await Promise.all(
        getFromLocalStorage(FLIPS_STORAGE_KEY).map(flip =>
          fetchFlip(flip.hash).then(data => ({
            ...flip,
            data,
          }))
        )
      )

      const fetchedFlips = responses.map(({data: {result}, ...rest}) => ({
        ...rest,
        pics: result ? decode(fromHexString(result.hex.substr(2)))[0] : [],
      }))

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
      <Box p="3rem">
        <Heading margin={`0 0 ${theme.spacings.normal}`}>My Flips</Heading>
        <Box css={{marginBottom: theme.spacings.large}}>
          <FlipToolbar
            activeFilter={filter}
            onFilter={setFilter}
            shouldShowAddFlip={!validationRunning}
          />
        </Box>
        <FlipList flips={flips[filter]} onUpdateFlips={setFlips(flips)} />
      </Box>
    </Layout>
  )
}
