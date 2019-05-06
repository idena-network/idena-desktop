import React, {useEffect, useState} from 'react'
import Layout from '../../components/layout'
import {Link, Box} from '../../shared/components'
import {fetchEpoch} from '../../shared/api/dna'

export default function() {
  const [epoch, setEpoch] = useState()

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const epochResult = await fetchEpoch()

      if (!ignore) {
        setEpoch(epochResult)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <Layout>
      <Box>
        <Link href="/validation/short">Short</Link>
      </Box>
      <Box>
        <Link href="/validation/long">Long</Link>
      </Box>
      <Box>{JSON.stringify(epoch)}</Box>
    </Layout>
  )
}
