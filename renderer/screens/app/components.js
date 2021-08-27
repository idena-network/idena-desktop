import React from 'react'
import {Flex, Heading} from '@chakra-ui/core'

export const Page = React.forwardRef(function Page(props, ref) {
  return (
    <Flex
      ref={ref}
      flexDirection="column"
      align="flex-start"
      flexBasis={0}
      flexGrow={999}
      maxH="100vh"
      minW="50%"
      px={20}
      py={6}
      overflowY="auto"
      {...props}
    />
  )
})

export function PageTitle(props) {
  return (
    <Heading as="h1" fontSize="xl" fontWeight={500} py={2} mb={4} {...props} />
  )
}
