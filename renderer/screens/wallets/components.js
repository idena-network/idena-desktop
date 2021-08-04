/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Flex,
  FormControl,
  Heading,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from '@chakra-ui/core'
import {
  Drawer,
  DrawerHeader,
  FormLabel,
} from '../../shared/components/components'

export function WalletCardMenu({children, ...props}) {
  return (
    <Menu autoSelect={false} {...props}>
      <MenuButton
        rounded="md"
        p="3/2"
        mt={-2}
        mr={-2}
        _expanded={{bg: 'gray.100'}}
        _focus={{outline: 0}}
      >
        <Flex align="center" justify="center" w={3}>
          <Icon name="more" size={5} />
        </Flex>
      </MenuButton>
      <MenuList
        placement="bottom-end"
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

export function WalletCardMenuItem({children, ...props}) {
  return (
    <MenuItem
      color="brandGray.500"
      fontWeight={500}
      px={3}
      py={2}
      _hover={{bg: 'gray.50'}}
      _focus={{bg: 'gray.50'}}
      _selected={{bg: 'gray.50'}}
      _active={{bg: 'gray.50'}}
      {...props}
    >
      <Stack isInline spacing={2} align="center">
        {React.Children.map(children, child => (
          <Box>{child}</Box>
        ))}
      </Stack>
    </MenuItem>
  )
}

export function WalletCardMenuItemIcon(props) {
  return <Icon size={5} color="blue.500" {...props} />
}

export function WalletDrawer({title, icon, color, children, ...props}) {
  return (
    <Drawer {...props}>
      {title && (
        <WalletDrawerHeader title={title}>
          <WalletDrawerHeaderIconBox icon={icon} color={color} />
        </WalletDrawerHeader>
      )}
      {children}
    </Drawer>
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

export function WalletDrawerHeaderIconBox({icon, color, children, ...props}) {
  return (
    <Flex
      align="center"
      justify="center"
      bg={`${color}.012`}
      borderRadius="xl"
      size={12}
      {...props}
    >
      {typeof icon === 'string' && (
        <WalletDrawerHeaderIcon name={icon} color={color} />
      )}
      {children}
    </Flex>
  )
}

export function WalletDrawerHeaderIcon({color, ...props}) {
  return <Icon size={6} color={`${color}.500`} {...props} />
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
