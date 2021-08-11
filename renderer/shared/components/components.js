/* eslint-disable react/prop-types */
import React from 'react'
import NextLink from 'next/link'
import {
  Code,
  Drawer as ChakraDrawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader as ChakraDrawerHeader,
  DrawerFooter as ChakraDrawerFooter,
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
  Button,
  NumberInput as ChakraNumberInput,
  Textarea as ChakraTextarea,
  Checkbox as ChakraCheckbox,
  Divider,
  Text,
  Icon,
  InputGroup,
  InputRightAddon,
  Link,
  Progress as ChakraProgress,
  Heading,
} from '@chakra-ui/core'
import {rem} from '../theme'
import {IconButton2} from './button'

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

export function FloatDebug({children, ...props}) {
  return (
    <Box position="absolute" left={6} bottom={6} zIndex="popover" {...props}>
      <Debug>{children}</Debug>
    </Box>
  )
}

export function Debug({children}) {
  return (
    <Code whiteSpace="pre-wrap" borderRadius="md" p={2}>
      {JSON.stringify(children, null, 2)}
    </Code>
  )
}

export function Drawer({isCloseable = true, children, ...props}) {
  return (
    <ChakraDrawer {...props}>
      <DrawerOverlay bg="xblack.080" />
      <DrawerContent px={8} py={12} maxW={360}>
        {isCloseable && <DrawerCloseButton />}
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

export function DrawerFooter(props) {
  return (
    <ChakraDrawerFooter
      mb={-12}
      mx={-8}
      px={4}
      py={3}
      borderTopColor="gray.300"
      borderTopWidth={1}
      {...props}
    />
  )
}

export function FormLabel(props) {
  return <ChakraFormLabel fontWeight={500} color="brandGray.500" {...props} />
}

// eslint-disable-next-line react/display-name
export const Input = React.forwardRef((props, ref) => (
  <ChakraInput
    ref={ref}
    alignItems="center"
    borderColor="gray.300"
    color="brandGray.500"
    fontSize="md"
    lineHeight="short"
    px={3}
    h={8}
    _disabled={{
      bg: 'gray.50',
      color: 'muted',
    }}
    _placeholder={{
      color: 'muted',
    }}
    {...props}
  />
))

export function NumberInput(props) {
  return (
    <ChakraNumberInput
      borderColor="gray.300"
      color="brandGray.500"
      fontSize="md"
      lineHeight="short"
      h={8}
      {...props}
    />
  )
}

export function Checkbox(props) {
  return <ChakraCheckbox borderColor="gray.100" {...props} />
}

export function Textarea(props) {
  return (
    <ChakraTextarea
      borderColor="gray.300"
      p={3}
      pt={2}
      pr={rem(18)}
      _placeholder={{
        color: 'muted',
      }}
      {...props}
    />
  )
}

export function ChainedInputGroup({addon, children, ...props}) {
  const {isDisabled} = props

  return (
    <InputGroup flex={1} {...props}>
      {addon ? (
        <>
          <ChainedInput {...props} />
          <ChainedInputAddon isDisabled={isDisabled}>%</ChainedInputAddon>
        </>
      ) : (
        children
      )}
    </InputGroup>
  )
}

export function ChainedInput(props) {
  const {isDisabled, bg, _hover} = props

  const borderRightColor = isDisabled ? 'gray.50' : bg

  return (
    <Input
      borderRightColor={borderRightColor}
      borderTopRightRadius={0}
      borderBottomRightRadius={0}
      _hover={{
        borderRightColor,
        ..._hover,
      }}
      {...props}
    />
  )
}

export function ChainedInputAddon({isDisabled, bg = 'white', ...props}) {
  return (
    <InputRightAddon
      bg={isDisabled ? 'gray.50' : bg}
      borderColor="gray.300"
      color="muted"
      h={8}
      px={3}
      {...props}
    />
  )
}

export function Avatar({address, ...props}) {
  return (
    <Image
      size={rem(80)}
      src={`https://robohash.idena.io/${address?.toLowerCase()}`}
      bg="gray.50"
      rounded="lg"
      ignoreFallback
      {...props}
    />
  )
}

export function Tooltip(props) {
  return (
    <ChakraTooltip
      bg="graphite.500"
      color="white"
      fontSize="sm"
      fontWeight={500}
      px={2}
      py={1}
      borderRadius="sm"
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
  actionContent,
  actionColor = status === 'error' ? 'red.500' : 'brandBlue.500',
  onAction,
  ...props
}) {
  const {color} = props
  return (
    <Alert
      status={status}
      bg="white"
      boxShadow="0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)"
      color="brandGray.500"
      fontSize="md"
      pl={4}
      pr={actionContent ? 2 : 5}
      pt={rem(10)}
      pb={3}
      mb={5}
      minH={rem(44)}
      rounded="lg"
      w="md"
      {...props}
    >
      <AlertIcon name={icon} size={5} color={color || 'blue.500'} />
      <Flex direction="column" align="flex-start" maxW="sm">
        <AlertTitle fontWeight={500} lineHeight="base">
          {title}
        </AlertTitle>
        <AlertDescription
          color={color || 'muted'}
          lineHeight="base"
          textAlign="left"
        >
          {description}
        </AlertDescription>
      </Flex>
      {actionContent && (
        <Button
          variant="ghost"
          color={actionColor}
          fontWeight={500}
          lineHeight="base"
          px={3}
          py="3/2"
          _hover={{bg: 'unset'}}
          _active={{bg: 'unset'}}
          _focus={{boxShadow: 'none'}}
          onClick={onAction}
        >
          {actionContent}
        </Button>
      )}
    </Alert>
  )
}

export function Dialog({
  title,
  children,
  isCloseable,
  shouldShowCloseButton = isCloseable || false,
  ...props
}) {
  return (
    <Modal isCentered size="sm" {...props}>
      <ModalOverlay bg="xblack.080" />
      <ModalContent
        bg="white"
        color="brandGray.500"
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

export function SuccessAlert({children, ...props}) {
  return (
    <Alert
      status="success"
      bg="green.010"
      borderWidth="1px"
      borderColor="green.050"
      fontWeight={500}
      rounded="md"
      px={3}
      py={2}
      {...props}
    >
      <AlertIcon name="info" color="green.500" size={5} mr={3} />
      {children}
    </Alert>
  )
}

export function FailAlert({children, ...props}) {
  return (
    <Alert
      status="error"
      bg="red.010"
      borderWidth="1px"
      borderColor="red.050"
      fontWeight={500}
      rounded="md"
      px={3}
      py={2}
      {...props}
    >
      <AlertIcon name="info" color="red.500" size={5} mr={3} />
      {children}
    </Alert>
  )
}

export const VDivider = React.forwardRef(function VDivider(props, ref) {
  return (
    <Divider
      ref={ref}
      orientation="vertical"
      borderColor="gray.300"
      h={6}
      mx={0}
      {...props}
    />
  )
})

export const HDivider = React.forwardRef(function HDivider(props, ref) {
  return <Divider ref={ref} borderColor="gray.300" my={0} {...props} />
})

export function ExternalLink({href, children, ...props}) {
  return (
    <Button
      variant="link"
      variantColor="brandBlue"
      fontWeight={500}
      alignSelf="flex-start"
      _hover={{background: 'transparent'}}
      _focus={{
        outline: 'none',
      }}
      onClick={() => {
        global.openExternal(href)
      }}
      {...props}
    >
      <Text as="span" lineHeight="short" mt="-2px">
        {children || href}
      </Text>
      <Icon name="chevron-down" size={4} transform="rotate(-90deg)" />
    </Button>
  )
}

export function GoogleTranslateButton({
  phrases = [],
  text = encodeURIComponent(phrases.join('\n\n')),
  locale = global.locale,
  children,
  ...props
}) {
  return (
    <IconButton2
      icon="gtranslate"
      _hover={{background: 'transparent'}}
      onClick={() => {
        global.openExternal(
          `https://translate.google.com/#view=home&op=translate&sl=auto&tl=${locale}&text=${text}`
        )
      }}
      {...props}
    >
      {children || 'Google Translate'}
    </IconButton2>
  )
}

export function TextLink({href, children, ...props}) {
  return (
    <NextLink href={href} passHref>
      <Link href={href} color="blue.500" {...props}>
        {children}
      </Link>
    </NextLink>
  )
}

export function Progress(props) {
  return (
    <ChakraProgress
      bg="xblack.016"
      borderRadius={2}
      color="blue"
      h={1}
      {...props}
    />
  )
}

export function SmallText(props) {
  return <Text color="muted" fontSize="sm" {...props} />
}

// eslint-disable-next-line react/display-name
export const IconLink = React.forwardRef(
  ({href, icon, children, ...props}, ref) => (
    <NextLink ref={ref} href={href} passHref>
      <Link
        href={href}
        color="brandBlue.500"
        rounded="md"
        fontWeight={500}
        display="inline-block"
        h={8}
        px={2}
        py="3/2"
        _hover={{
          bg: 'blue.50',
        }}
        {...props}
      >
        <Stack spacing={2} isInline align="center">
          {typeof icon === 'string' ? <Icon name={icon} size={4} /> : icon}
          <Text as="span">{children}</Text>
        </Stack>
      </Link>
    </NextLink>
  )
)

export function Snackbar(props) {
  return (
    <Flex
      justify="center"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      zIndex="toast"
      {...props}
    />
  )
}
