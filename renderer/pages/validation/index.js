import React from 'react'
import Layout from '../../components/layout'
import {Link, Box} from '../../shared/components'

export default function() {
  return (
    <Layout>
      <Box>
        <Link href="/validation/screens/short">Short</Link>
      </Box>
      <Box>
        <Link href="/validation/screens/long">Long</Link>
      </Box>
    </Layout>
  )
}
