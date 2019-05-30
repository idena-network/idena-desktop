import React, {useState} from 'react'
import Layout from '../../components/layout'
import {Link, Box, Button} from '../../shared/components'
import Flex from '../../shared/components/flex'
import theme from '../../shared/theme'

export default function() {
  const {
    getCurrentValidation,
    saveLongAnswers,
    saveShortAnswers,
    deleteValidation,
  } = global.validationStore

  const [validation, setValidation] = useState()

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
      <Flex>
        <Button
          onClick={() => {
            saveShortAnswers([1, 2, 3, 4])
          }}
        >
          Save short
        </Button>
        <Button
          onClick={() => {
            saveLongAnswers([4, 3, 2, 1, 2, 3, 4])
          }}
        >
          Save long
        </Button>
        <Button
          onClick={() => {
            deleteValidation()
          }}
        >
          Delete
        </Button>
        <Button
          onClick={() => {
            setValidation(JSON.stringify(getCurrentValidation()))
          }}
        >
          Get validation
        </Button>
      </Flex>
      <Box>
        <code>{validation}</code>
      </Box>
    </Layout>
  )
}
