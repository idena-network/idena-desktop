import React from 'react'
import {Code} from '@chakra-ui/core'

// eslint-disable-next-line react/prop-types
export function Debug({children}) {
  return <Code>{JSON.stringify(children, null, 2)}</Code>
}
