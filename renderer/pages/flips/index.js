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
  FLIPS_FILTER,
  setToLocalStorage,
} from './utils/storage'
import theme from '../../shared/theme'
import NetContext from '../../shared/providers/net-provider'

const filters = {
  flips: 'flips',
  drafts: 'drafts',
}

export default function() {
  const [flips, setFlips] = useState({flips: [], drafts: []})
  const [filter, setFilter] = useState(filters.flips)

  const {validationRunning} = useContext(NetContext)

  useEffect(() => {
    if (localStorage) {
      const savedFilter = getFromLocalStorage(FLIPS_FILTER, '')
      if (savedFilter) {
        setFilter(savedFilter)
      }
    }
  }, [])

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

    if (filter === filters.drafts) {
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
            onFilter={nextFilter => {
              setFilter(nextFilter)
              setToLocalStorage(FLIPS_FILTER, nextFilter)
            }}
            shouldShowAddFlip={!validationRunning}
          />
        </Box>
        <FlipList
          flips={flips[filter]}
          onUpdateFlips={nextDrafts => {
            setFlips({...flips, drafts: nextDrafts})
          }}
        />
      </Box>
    </Layout>
  )
}
