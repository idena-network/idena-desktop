/* eslint-disable react/prop-types */
import React from 'react'
import {
  Button as ChakraButton,
  IconButton as ChakraIconButton,
  PseudoBox,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/core'
import {rem} from '../theme'

const BaseButton = React.forwardRef((props, ref) => (
  <ChakraButton
    ref={ref}
    fontWeight={500}
    h={8}
    px={4}
    py="3/2"
    rounded="md"
    _disabled={{
      bg: 'gray.300',
      color: 'rgb(150 153 158)',
    }}
    {...props}
  />
))
BaseButton.displayName = 'BaseButton'

export const PrimaryButton = React.forwardRef((props, ref) => (
  <BaseButton ref={ref} variantColor="brandBlue" color="white" {...props} />
))
PrimaryButton.displayName = 'PrimaryButton'

// eslint-disable-next-line react/display-name
export const SecondaryButton = React.forwardRef((props, ref) => (
  <PseudoBox
    ref={ref}
    as="button"
    bg="brandBlue.10"
    color="brandBlue.500"
    fontSize="md"
    fontWeight={500}
    h={8}
    px={4}
    py="3/2"
    rounded="md"
    transition="all 0.2s cubic-bezier(.08,.52,.52,1)"
    _hover={{bg: 'brandBlue.20'}}
    _active={{
      bg: 'brandBlue.50',
      transform: 'scale(0.98)',
    }}
    _focus={{
      shadow: 'outline',
      outline: 'none',
    }}
    _disabled={{
      bg: 'gray.50',
      color: 'rgb(150 153 158)',
    }}
    // eslint-disable-next-line react/destructuring-assignment
    disabled={props.isDisabled}
    {...props}
  />
))

// eslint-disable-next-line react/display-name
export const IconButton2 = React.forwardRef(
  ({icon, children, ...props}, ref) => (
    <ChakraButton
      ref={ref}
      variant="ghost"
      variantColor="blue"
      fontWeight={500}
      h={8}
      px={2}
      py="3/2"
      justifyContent="flex-start"
      {...props}
    >
      <Stack isInline spacing={2} align="center">
        {typeof icon === 'string' ? <Icon name={icon} size={5} mr={2} /> : icon}
        <Text as="span">{children}</Text>
      </Stack>
    </ChakraButton>
  )
)

export const InfoButton = React.forwardRef((props, ref) => (
  <ChakraIconButton
    ref={ref}
    icon="info"
    color="brandBlue.500"
    bg="unset"
    fontSize={rem(20)}
    minW={5}
    w={5}
    h={5}
    _active={{
      bg: 'unset',
    }}
    _hover={{
      bg: 'unset',
    }}
    _focus={{
      outline: 'none',
    }}
    {...props}
  />
))
InfoButton.displayName = 'InfoButton'
