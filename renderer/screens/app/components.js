/* eslint-disable react/prop-types */
import {Flex, Heading} from '@chakra-ui/core'

export function LayoutContainer(props) {
  return (
    <Flex
      align="stretch"
      flexWrap="wrap"
      minH="100vh"
      color="brand.gray"
      fontSize="md"
      {...props}
    />
  )
}

export function Page(props) {
  return (
    <Flex
      flexDirection="column"
      align="flex-start"
      flexBasis={0}
      flexGrow={999}
      maxH="100vh"
      minW="50%"
      px={20}
      py={6}
      overflowY="hidden"
      {...props}
    />
  )
}

export function PageTitle(props) {
  return (
    <Heading as="h1" fontSize="3xl" fontWeight={500} py={2} mb={4} {...props} />
  )
}
