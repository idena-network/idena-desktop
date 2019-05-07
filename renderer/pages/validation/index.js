import React, {useState} from 'react'
import Layout from '../../components/layout'
import {Link, Box} from '../../shared/components'
import {fetchEpoch} from '../../shared/api/dna'
import {useInterval} from './shared/utils/useInterval'
import Flex from '../../shared/components/flex'
import theme from '../../shared/theme'

export default function() {
  const [epoch, setEpoch] = useState()

  useInterval(() => {
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
  }, 1000)

  return (
    <Layout>
      <Flex>
        <Box p={theme.spacings.small}>
          <Link href="/validation/short">Short</Link>
        </Box>
        <Box p={theme.spacings.small}>
          <Link href="/validation/long">Long</Link>
        </Box>
      </Flex>
      {epoch && (
        <Box
          bg={epoch.currentPeriod.toLowerCase() === 'none' ? 'green' : 'red'}
          p={theme.spacings.normal}
        >
          <pre>{JSON.stringify(epoch)}</pre>
        </Box>
      )}
    </Layout>
  )
}
