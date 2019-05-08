import React from 'react'
import Layout from '../../components/layout'
import {Link, Box} from '../../shared/components'
import Flex from '../../shared/components/flex'
import theme from '../../shared/theme'

export default function() {
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
    </Layout>
  )
}
