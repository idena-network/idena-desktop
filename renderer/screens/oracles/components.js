/* eslint-disable react/prop-types */
import React from 'react'
import {
  Flex,
  Icon,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
  Badge,
  Radio,
  RadioGroup,
  Text,
  Box,
  Skeleton,
} from '@chakra-ui/core'
import {
  DrawerHeader,
  DrawerBody,
  Input,
} from '../../shared/components/components'
import {VoteOption} from '../../shared/types'
import {rem} from '../../shared/theme'

export function OracleDrawerHeader({
  icon,
  variantColor = 'blue',
  children,
  ...props
}) {
  return (
    <DrawerHeader mb={8} {...props}>
      <Flex
        align="center"
        justify="center"
        bg={`${variantColor}.012`}
        h={12}
        w={12}
        rounded="xl"
      >
        <Icon name={icon} w={6} h={6} color={`${variantColor}.500`} />
      </Flex>
      <Heading
        color="brandGray.500"
        fontSize="lg"
        fontWeight={500}
        lineHeight="base"
        mt={4}
      >
        {children}
      </Heading>
    </DrawerHeader>
  )
}

export function OracleDrawerBody(props) {
  return (
    <DrawerBody>
      <Stack spacing={5} {...props} />
    </DrawerBody>
  )
}

export function OracleFormControl({label, children, ...props}) {
  return (
    <FormControl {...props}>
      <FormLabel color="brandGray.500" mb={2}>
        {label}
      </FormLabel>
      {children}
    </FormControl>
  )
}
export function OracleFormHelper({label, value, ...props}) {
  return (
    <Flex justify="space-between">
      <OracleFormHelperText {...props}>{label}</OracleFormHelperText>
      <OracleFormHelperText {...props}>{value}</OracleFormHelperText>
    </Flex>
  )
}

export function OracleFormHelperText(props) {
  return <FormHelperText color="muted" fontSize="md" {...props} />
}

export function VotingBadge(props) {
  return (
    <Badge
      display="flex"
      alignItems="center"
      borderRadius="xl"
      fontSize="sm"
      fontWeight={500}
      textTransform="capitalize"
      h={6}
      px={3}
      {...props}
    />
  )
}

export function VotingFilterList(props) {
  return <RadioGroup variantColor="brandBlue" {...props} />
}

export const VotingFilter = React.forwardRef(function VotingFilterRef(
  {value, ...props},
  ref
) {
  return (
    <Radio
      borderColor="gray.100"
      textTransform="capitalize"
      value={value}
      ref={ref}
      {...props}
    >
      {value}
    </Radio>
  )
})

export function VotingResultBar({value, action, ...props}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      bg={action === VoteOption.Confirm ? 'blue.012' : 'gray.50'}
      borderRadius="md"
      textTransform="capitalize"
      px={2}
      h={6}
      w={`${value}%`}
      {...props}
    >
      <Text>{action}</Text>
      <Text fontWeight={500}>{`${value}%`}</Text>
    </Flex>
  )
}

export function VotingInlineFormControl({label, children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack isInline spacing={5}>
        <FormLabel w={rem(100)}>{label}</FormLabel>
        {children}
      </Stack>
    </FormControl>
  )
}

export function VotingOptionText({label, ...props}) {
  return (
    <FormControl {...props}>
      <Flex align="center" justify="space-between">
        <FormLabel color="muted">{label}</FormLabel>
        <Input w="2xs" />
      </Flex>
    </FormControl>
  )
}

export function VotingCardSkeleton(props) {
  return (
    <Box {...props}>
      <Skeleton h={12} mb={2} />
      <Skeleton h={16} />
    </Box>
  )
}
