import React, {useEffect, useState} from 'react'
import Layout from '../../components/layout'
import {Heading} from '../../shared/components'
import FlipToolbar from './components/toolbar'
import FlipList from './components/flip-list'

export default function() {
  const [flips, setFlips] = useState([])
  const [filter, setFilter] = useState('flips')

  useEffect(() => {
    if (filter === 'drafts') {
      const drafts =
        JSON.parse(localStorage.getItem('idena/flips/drafts')) || []
      setFlips(drafts)
    } else {
      setFlips([])
    }
  }, [filter])

  return (
    <Layout>
      <Heading>My Flips</Heading>
      <FlipToolbar activeFilter={filter} onFilter={setFilter} />
      <FlipList flips={flips} />
    </Layout>
  )
}
