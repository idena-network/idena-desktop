import React from 'react'
import nanoid from 'nanoid'
import {Heading, Box} from '../../shared/components'
import CreateFlipMaster from './screens/create-flip/components/create-flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'

export default function() {
  return (
    <Layout>
      <Box p={theme.spacings.large}>
        <Heading>New flip</Heading>
        <CreateFlipMaster id={nanoid()} />
      </Box>
    </Layout>
  )
}
