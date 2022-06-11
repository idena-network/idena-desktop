/* eslint-disable react/prop-types */
import * as React from 'react'
import {IconButton, Menu, MenuButton, MenuList, Td} from '@chakra-ui/react'
import {MoreIcon} from '../../shared/components/icons'

export function WalletCardMenu({children, ...props}) {
  return (
    <Menu autoSelect={false} {...props}>
      <MenuButton
        as={IconButton}
        icon={<MoreIcon boxSize="5" />}
        variant="menu"
        size="menu"
        color="muted"
      />
      <MenuList
        placement="bottom-end"
        border="none"
        borderRadius="lg"
        boxShadow="base"
        minW="fit-content"
      >
        {children}
      </MenuList>
    </Menu>
  )
}

export function WalletListTd(props) {
  return (
    <Td
      px="3"
      py="1.5"
      borderBottomColor="gray.100"
      borderBottomWidth="px"
      {...props}
    />
  )
}
