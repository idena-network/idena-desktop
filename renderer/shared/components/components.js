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
  Stack,
  FormControl,
  Heading,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {rem} from '../theme'
import {PrimaryButton} from './button'

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
  return <ChakraFormLabel fontWeight={500} color="brandGray.500" {...props} />
}

export function Input(props) {
  return (
    <ChakraInput
      alignItems="center"
      borderColor="gray.300"
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
  return (
    <Image
      size={rem(80)}
      src={`https://robohash.org/${address}`}
      bg="gray.50"
      rounded="lg"
      ignoreFallback
      {...props}
    />
  )
}

export function SendInviteDrawer({children, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={`0x${'2'.repeat(64)}`} mx="auto" />
        <Heading
          fontSize="lg"
          fontWeight={500}
          color="brandGray.500"
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Invite new person')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>{children}</DrawerBody>
    </Drawer>
  )
}

export function SendInviteForm({onSendingInvite}) {
  const {t} = useTranslation()
  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={e => {
        const {
          address: {value: address},
          firstName: {value: firstName},
          lastName: {value: lastName},
        } = e.target.elements
        onSendingInvite({address, firstName, lastName})
        e.preventDefault()
      }}
    >
      <FormControl>
        <FormLabel htmlFor="address">{t('Address')}</FormLabel>
        <Input
          id="address"
          placeholder="Send directly to given address, or skip"
        />
      </FormControl>
      <Stack isInline spacing={4}>
        <FormControl>
          <FormLabel htmlFor="firstName">{t('First name')}</FormLabel>
          <Input id="firstName" />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="lastName">{t('Last name')}</FormLabel>
          <Input id="lastName" />
        </FormControl>
      </Stack>
      <PrimaryButton ml="auto" type="submit">
        {t('Create invitation')}
      </PrimaryButton>
    </Stack>
  )
}

export function Debug({children}) {
  return <Code>{JSON.stringify(children, null, 2)}</Code>
}
