import React, {useState} from 'react'
import nanoid from 'nanoid'
import {Heading, Box} from '../../shared/components'
import CreateFlipMaster from '../../screens/flips/screens/create-flip/components/flip-master'
import Layout from '../../components/layout'
import theme from '../../shared/theme'

function NewFlip() {
  const [id] = useState(nanoid())

  return (
    <Layout>
      <Box p={theme.spacings.large}>
        <Heading>New flip</Heading>
        <CreateFlipMaster id={id} />
      </Box>
    </Layout>
  )
}

export default NewFlip
