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
  Image,
  Tooltip as ChakraTooltip,
  Flex,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
  Box,
  useColorMode,
} from '@chakra-ui/core'
import theme, {rem} from '../theme'

export function FloatDebug({children, ...props}) {
  return (
    <Box position="absolute" left={6} bottom={6} zIndex="popover" {...props}>
      <Debug>{children}</Debug>
    </Box>
  )
}

export function Debug({children}) {
  return (
    <Code whiteSpace="pre" borderRadius="md" p={2}>
      {JSON.stringify(children, null, 2)}
    </Code>
  )
}

export function Drawer({children, ...props}) {
  return (
    <ChakraDrawer {...props}>
      <DrawerOverlay bg="xblack.080" />
      <DrawerContent px={8} py={12} maxW={360}>
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
  const {colorMode} = useColorMode()
  return (
    <ChakraFormLabel
      fontWeight={500}
      color={theme.colors[colorMode].text}
      {...props}
    />
  )
}

export function Input(props) {
  const {colorMode} = useColorMode()
  return (
    <ChakraInput
      alignItems="center"
      borderColor={colorMode === 'light' ? 'gray.300' : 'gray.600'}
      fontSize="md"
      lineHeight="short"
      px={3}
      h={8}
      _placeholder={{
        color: 'muted',
      }}
      {...props}
    />
  )
}

export function Avatar({address, ...props}) {
  const {colorMode} = useColorMode()
  return (
    <Image
      size={rem(80)}
      src={`https://robohash.org/${address}`}
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      rounded="lg"
      ignoreFallback
      {...props}
    />
  )
}

export function Tooltip(props) {
  return (
    <ChakraTooltip
      bg="black"
      color="white"
      fontSize="sm"
      px={2}
      py={1}
      rounded="md"
      hasArrow
      {...props}
    />
  )
}

export function Toast({
  title,
  description,
  icon = 'info',
  status = 'info',
  ...props
}) {
  return (
    <Alert
      status={status}
      bg="white"
      boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
      color="brandGray.500"
      fontSize="md"
      pl={4}
      pr={5}
      pt={rem(10)}
      pb={3}
      mb={5}
      minH={rem(44)}
      rounded="lg"
      {...props}
    >
      <AlertIcon name={icon} size={5} />
      <Flex direction="column" align="flex-start">
        <AlertTitle fontWeight={500} lineHeight="base">
          {title}
        </AlertTitle>
        <AlertDescription color="muted" lineHeight="base">
          {description}
        </AlertDescription>
      </Flex>
    </Alert>
  )
}

export function Dialog({
  title,
  children,
  shouldShowCloseButton = false,
  ...props
}) {
  const {colorMode} = useColorMode()
  return (
    <Modal isCentered size="sm" {...props}>
      <ModalOverlay bg="xblack.080" />
      <ModalContent
        bg={colorMode === 'light' ? 'white' : 'black'}
        fontSize="md"
        p={8}
        pt={6}
        my={0}
        rounded="lg"
      >
        {title && <DialogHeader>{title}</DialogHeader>}
        {shouldShowCloseButton && <ModalCloseButton />}
        {children}
      </ModalContent>
    </Modal>
  )
}

export function DialogHeader(props) {
  return <ModalHeader p={0} mb={2} fontSize="lg" fontWeight={500} {...props} />
}

export function DialogBody(props) {
  return <ModalBody p={0} mb={6} {...props} />
}

export function DialogFooter({children, ...props}) {
  return (
    <ModalFooter p={0} {...props}>
      <Stack isInline spacing={2} justify="flex-end">
        {children}
      </Stack>
    </ModalFooter>
  )
}
