/* eslint-disable react/prop-types */
import React, {forwardRef} from 'react'
import {
  Box,
  Flex,
  Stack,
  StatLabel,
  StatNumber,
  Menu,
  MenuButton,
  Icon,
  MenuList,
  PseudoBox,
  MenuItem,
  FormControl,
  Heading,
  Tab,
  NumberInputField,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {rem} from '../../shared/theme'
import {
  FormLabel,
  Input,
  NumberInput,
  Textarea,
} from '../../shared/components/components'

export function AdStatLabel(props) {
  return <StatLabel color="muted" fontSize="md" {...props} />
}

export function AdStatNumber(props) {
  return <StatNumber fontSize="md" fontWeight={500} {...props} />
}

export function SmallTargetFigure({children = 'Any', ...props}) {
  return (
    <AdStatNumber fontSize={rem(11)} {...props}>
      {children}
    </AdStatNumber>
  )
}

export function AdList(props) {
  return <Stack {...props} />
}

export function AdEntry(props) {
  return <Box {...props} />
}

export function NoAds() {
  const {t} = useTranslation()
  return (
    <Flex
      flexDirection="column"
      align="center"
      alignSelf="stretch"
      justify="center"
      color="muted"
      my="auto"
    >
      {t(`You haven't created any ads yet`)}
    </Flex>
  )
}

export function AdMenu(props) {
  return (
    <Menu autoSelect={false}>
      <MenuButton
        rounded="md"
        py={rem(6)}
        px={rem(2)}
        _hover={{bg: 'gray.50'}}
        _expanded={{bg: 'gray.50'}}
        _focus={{outline: 0}}
      >
        <Icon name="more" size={5} />
      </MenuButton>
      <MenuList
        placement="bottom-end"
        border="none"
        shadow="0 4px 6px 0 rgba(83, 86, 92, 0.24), 0 0 2px 0 rgba(83, 86, 92, 0.2)"
        rounded="lg"
        py={2}
        minWidth="145px"
        {...props}
      />
    </Menu>
  )
}

export function AdMenuItem(props) {
  return (
    <PseudoBox
      as={MenuItem}
      fontWeight={500}
      lineHeight={rem(20)}
      px={3}
      py={rem(6)}
      _hover={{bg: 'gray.50'}}
      _focus={{bg: 'gray.50'}}
      _selected={{bg: 'gray.50'}}
      _active={{bg: 'gray.50'}}
      {...props}
    />
  )
}

export function AdMenuItemIcon(props) {
  return <Icon size={5} mr={3} color="brandBlue.500" {...props} />
}

// eslint-disable-next-line react/display-name
export const AdFormTab = forwardRef(({isSelected, ...props}, ref) => (
  <Tab
    ref={ref}
    isSelected={isSelected}
    color="muted"
    fontWeight={500}
    py={2}
    px={4}
    rounded="md"
    _selected={{bg: 'brandBlue.50', color: 'brandBlue.500'}}
    {...props}
  />
))

// eslint-disable-next-line react/prop-types
export function FormSection(props) {
  return <Box {...props} />
}

export function FormSectionTitle(props) {
  return (
    <Heading
      as="h3"
      py="10px"
      mb={2}
      fontSize="14px"
      fontWeight={500}
      {...props}
    />
  )
}

// eslint-disable-next-line react/prop-types
export function AdFormField({label, id, children}) {
  return (
    <FormControl as={Flex}>
      <FormLabel htmlFor={id} color="muted" w={rem(120)} pt={2}>
        {label}
      </FormLabel>
      <Box w={rem(360)}>
        {React.cloneElement(children, {
          id,
          fontWeight: 500,
        })}
      </Box>
    </FormControl>
  )
}

export function AdInput(props) {
  return <Input px={3} py={2} {...props} />
}

export function AdTextarea(props) {
  return <Textarea px={3} py={2} {...props} />
}

// eslint-disable-next-line react/prop-types
export function AdNumberInput(props) {
  return (
    <NumberInput w="100%" {...props}>
      <NumberInputField inputMode="numeric" pattern="[0-9]*" px={3} py={2} />
    </NumberInput>
  )
}

export function AdFooter(props) {
  return (
    <Box
      bg="white"
      borderTop="1px"
      borderTopColor="gray.100"
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      px={4}
      py={3}
    >
      <Stack isInline spacing={2} justify="flex-end" {...props} />
    </Box>
  )
}
