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
  useTheme,
  Divider,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  DrawerHeader,
  DrawerBody,
  Input,
} from '../../shared/components/components'
import {IconButton2} from '../../shared/components/button'
import {toPercent} from '../../shared/utils/utils'

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
      display="inline-flex"
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

export function VotingResultBar({label, value, isMax, ...props}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      textTransform="capitalize"
      position="relative"
      px={2}
      h={6}
      w="full"
      {...props}
    >
      <Box
        borderRadius="md"
        bg="blue.012"
        position="absolute"
        left={0}
        width={value > 0 ? `${value * 100}%` : 1}
        top={0}
        bottom={0}
        zIndex={-1}
      />
      <Stack isInline spacing={1} align="center">
        <Text>{label}</Text>
        {isMax && <Icon name="ok" size={4} color="brandBlue.500" />}
      </Stack>
      <Text fontWeight={500} textTransform="initial">
        {toPercent(value)}
      </Text>
    </Flex>
  )
}

export function VotingInlineFormControl({
  id,
  type = 'text',
  label,
  defaultValue,
  value,
  helperText,
  children,
  ...props
}) {
  return (
    <FormControl {...props}>
      <Stack isInline>
        <FormLabel htmlFor={id} color="muted" py={2} minW={32} w={32}>
          {label}
        </FormLabel>
        {children || (
          <Box w="md">
            <Input
              id={id}
              type={type}
              defaultValue={defaultValue}
              value={value}
            />
            {helperText && (
              <FormHelperText color="muted">{helperText}</FormHelperText>
            )}
          </Box>
        )}
      </Stack>
    </FormControl>
  )
}

export function VotingOptionText({label, onChange, ...props}) {
  return (
    <FormControl {...props}>
      <Flex align="center" justify="space-between">
        <FormLabel color="muted">{label}</FormLabel>
        <Input w="2xs" onChange={onChange} />
      </Flex>
    </FormControl>
  )
}

export function VotingCardSkeleton(props) {
  return (
    <Box {...props}>
      <Stack isInline spacing={2} align="center" mb={3}>
        <VotingSkeleton h={6} w={16} />
        <VotingSkeleton h={6} />
      </Stack>
      <Stack spacing={2} mb={4}>
        <VotingSkeleton h={6} />
        <VotingSkeleton h={16} />
      </Stack>
      <Stack isInline spacing={2} align="center" mb={6}>
        <VotingSkeleton borderRadius="full" h={5} w={5} />
        <VotingSkeleton h={5} />
      </Stack>
      <Flex justify="space-between" align="center">
        <VotingSkeleton h={8} w={20} />
        <VotingSkeleton h={8} w={64} />
      </Flex>
      <VotingListDivider />
    </Box>
  )
}

export function VotingSkeleton(props) {
  const {colors} = useTheme()
  return (
    <FullSkeleton
      colorStart={colors.gray[50]}
      colorEnd={colors.gray[300]}
      {...props}
    />
  )
}

function FullSkeleton(props) {
  return <Skeleton w="full" {...props} />
}

export function VotingListDivider() {
  return <Divider borderColor="gray.300" mt={6} mb={0} />
}

export function VotingFormAdvancedToggle(props) {
  const {t} = useTranslation()
  return (
    <IconButton2 icon="chevron-down" my={2} {...props}>
      <Flex flex={1} justify="space-between">
        <Text>{t('Part of the options is hidden')}</Text>
        <Text>{t('Show all')}</Text>
      </Flex>
    </IconButton2>
  )
}

// eslint-disable-next-line react/display-name
export const VotingOption = React.forwardRef(
  ({value, annotation, ...props}, ref) => (
    <Flex
      justify="space-between"
      border="1px"
      borderColor="gray.300"
      borderRadius="md"
      px={3}
      py={2}
    >
      <Radio ref={ref} borderColor="gray.100" value={value} {...props}>
        {value}
      </Radio>
      <Text color="muted" fontSize="sm">
        {annotation}
      </Text>
    </Flex>
  )
)
