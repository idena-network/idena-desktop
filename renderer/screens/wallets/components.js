/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Flex,
  FormControl,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from '@chakra-ui/react'
import {DrawerHeader, FormLabel} from '../../shared/components/components'
import {MoreIcon} from '../../shared/components/icons'
import {AdDrawer} from '../ads/containers'

export function WalletCardMenu({children, ...props}) {
  return (
    <Menu autoSelect={false} placement="bottom-end" {...props}>
      <MenuButton
        rounded="md"
        p="1.5"
        mt="-2"
        mr="-2"
        _expanded={{bg: 'gray.100'}}
        _focus={{outline: 0}}
        zIndex="dropdown"
      >
        <Flex align="center" justify="center" w="3">
          <MoreIcon boxSize="5" />
        </Flex>
      </MenuButton>
      <MenuList
        border="none"
        shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
        rounded="lg"
        py={2}
        minWidth="145px"
      >
        {children}
      </MenuList>
    </Menu>
  )
}

export function WalletCardMenuItem(props) {
  return (
    <MenuItem
      color="gray.500"
      fontWeight={500}
      px="3"
      py="2"
      _hover={{bg: 'gray.50'}}
      _focus={{bg: 'gray.50'}}
      _selected={{bg: 'gray.50'}}
      _active={{bg: 'gray.50'}}
      {...props}
    />
  )
}

export function WalletDrawer({title, icon, color, children, ...props}) {
  return (
    <AdDrawer {...props} closeOnOverlayClick={false}>
      {title && (
        <WalletDrawerHeader title={title}>
          <WalletDrawerHeaderIconBox icon={icon} color={color} />
        </WalletDrawerHeader>
      )}
      {children}
    </AdDrawer>
  )
}

export function WalletDrawerHeader({title, children, ...props}) {
  return (
    <DrawerHeader {...props}>
      <Stack spacing={4}>
        {children}
        <Heading color="brandGray.500" fontSize="lg" fontWeight={500}>
          {title}
        </Heading>
      </Stack>
    </DrawerHeader>
  )
}

export function WalletDrawerHeaderIconBox({colorScheme, ...props}) {
  return (
    <Flex
      align="center"
      justify="center"
      bg={`${colorScheme}.012`}
      borderRadius="xl"
      boxSize={12}
      {...props}
    />
  )
}

export function WalletDrawerForm(props) {
  return <Flex as="form" direction="column" flex={1} mt={6} {...props} />
}

export function WalletDrawerFormControl({label, children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack spacing={2}>
        {label && <FormLabel p={0}>{label}</FormLabel>}
        {children}
      </Stack>
    </FormControl>
  )
}
