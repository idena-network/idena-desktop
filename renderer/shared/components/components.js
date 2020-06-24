/* eslint-disable react/prop-types */
import React from 'react'
import {
  Code,
  Drawer as ChakraDrawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader as ChakraDrawerHeader,
  DrawerBody as ChakraDrawerBody,
  Input as ChakraInput,
  FormLabel as ChakraFormLabel,
} from '@chakra-ui/core'

export function Drawer({children, ...props}) {
  return (
    <ChakraDrawer {...props}>
      <DrawerOverlay bg="xblack.080" />
      <DrawerContent px={8} py={10} w={360}>
        <DrawerCloseButton />
        {children}
      </DrawerContent>
    </ChakraDrawer>
  )
}
export function DrawerHeader(props) {
  return <ChakraDrawerHeader p={0} mb={3} {...props} />
}

export function DrawerBody(props) {
  return <ChakraDrawerBody p={0} {...props} />
}

export function FormLabel(props) {
  return <ChakraFormLabel fontWeight={500} color="brandGray.500" {...props} />
}

export function Input(props) {
  return (
    <ChakraInput
      borderColor="gray.300"
      fontSize="md"
      lineHeight="18px"
      px={3}
      pt="3/2"
      pb={2}
      h="auto"
      _placeholder={{
        color: 'muted',
      }}
      {...props}
    />
  )
}

export function Debug({children}) {
  return <Code>{JSON.stringify(children, null, 2)}</Code>
}
