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
  InputGroup,
  InputRightAddon,
  Button,
  IconButton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  DrawerHeader,
  DrawerBody,
  Input,
} from '../../shared/components/components'
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

export function VotingResultBar({
  label,
  value,
  percentage,
  isMax,
  isWinner,
  ...props
}) {
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
        bg={isMax ? 'blue.012' : 'gray.50'}
        position="absolute"
        left={0}
        width={percentage > 0 ? `${percentage * 100}%` : 1}
        top={0}
        bottom={0}
        zIndex={-1}
      />
      <Stack isInline spacing={1} align="center">
        <Text>{label}</Text>
        {isWinner && <Icon name="ok" size={4} color="brandBlue.500" />}
      </Stack>
      <Text fontWeight={500} textTransform="initial">
        {toPercent(percentage)} ({value})
      </Text>
    </Flex>
  )
}

export function VotingInlineFormControl({
  id: htmlFor,
  type = 'text',
  label,
  defaultValue,
  value,
  min,
  max,
  helperText,
  children,
  unit: addon,
  ...props
}) {
  return (
    <FormControl display="inline-flex" {...props}>
      <FormLabel htmlFor={htmlFor} color="muted" py={2} minW={32} w={32}>
        {label}
      </FormLabel>
      {children || (
        <Box w="md">
          {addon ? (
            <InputWithRightAddon
              id={htmlFor}
              type={type}
              defaultValue={defaultValue}
              value={value}
              min={min}
              max={max}
              addon={addon}
            />
          ) : (
            <Input
              id={htmlFor}
              type={type}
              defaultValue={defaultValue}
              value={value}
              min={min}
              max={max}
            />
          )}
          {helperText && (
            <FormHelperText color="muted">{helperText}</FormHelperText>
          )}
        </Box>
      )}
    </FormControl>
  )
}

export function DnaInput(props) {
  return (
    <InputWithRightAddon
      addon="iDNA"
      type="number"
      min={0}
      required
      {...props}
    />
  )
}

function InputWithRightAddon({
  addon,
  size,
  isDisabled,
  _disabled = {
    bg: 'gray.50',
  },
  _hover,
  ...props
}) {
  const bg = isDisabled ? _disabled.bg : 'white'
  return (
    <InputGroup size={size}>
      <Input
        borderRightColor={bg}
        borderTopRightRadius={0}
        borderBottomRightRadius={0}
        _hover={{
          borderRightColor: bg,
          ..._hover,
        }}
        {...props}
      />
      <InputRightAddon
        bg={bg}
        borderColor="gray.300"
        color="muted"
        h={8}
        px={3}
      >
        {addon}
      </InputRightAddon>
    </InputGroup>
  )
}

export function VotingOptionInput({
  isLast,
  onAddOption,
  onRemoveOption,
  ...props
}) {
  return (
    <React.Fragment>
      <Flex align="center" justify="space-between">
        <Stack isInline spacing={1} flex={1}>
          <Flex h={6} w={6} align="center" justify="center">
            <Box bg="muted" borderRadius="full" h={1} w={1} />
          </Flex>
          <Input
            border="none"
            px={0}
            h="auto"
            _focus={null}
            _placeholder={{
              color: 'muted',
            }}
            onFocus={() => {
              if (isLast) onAddOption()
            }}
            {...props}
          />
        </Stack>
        <IconButton
          icon="cross-small"
          bg="unset"
          color="muted"
          fontSize={20}
          w={5}
          minW={5}
          h={5}
          p={0}
          _hover={{
            bg: 'gray.50',
          }}
          _focus={{
            bg: 'gray.50',
          }}
          onClick={onRemoveOption}
        />
      </Flex>
      {!isLast && <Divider borderBottomColor="gray.300" mx={-1} />}
    </React.Fragment>
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

export function VotingFormAdvancedToggle({isOpen, ...props}) {
  const {t} = useTranslation()
  return (
    <Button
      variant="ghost"
      p={0}
      ml={32}
      mr="auto"
      _hover={{background: 'transparent'}}
      _active={{background: 'transparent'}}
      _focus={{outline: 'none'}}
      {...props}
    >
      {t('Advanced')}
      <Icon
        size={5}
        name="chevron-down"
        color="muted"
        ml={1}
        transform={isOpen ? 'rotate(180deg)' : ''}
        transition="all 0.2s ease-in-out"
      />
    </Button>
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

export function FillCenter(props) {
  return (
    <Flex
      direction="column"
      flex={1}
      align="center"
      justify="center"
      {...props}
    />
  )
}

export function FillPlaceholder(props) {
  return (
    <Flex direction="column" flex={1} align="center" justify="center">
      <Text color="muted" {...props} />
    </Flex>
  )
}

export function NewVotingFormSkeleton() {
  return (
    <Stack spacing={3} my={8} w="xl">
      {Array.from({length: 6}).map((_, idx) => (
        <VotingSkeleton h={idx === 1 ? 32 : 8} key={idx} />
      ))}
    </Stack>
  )
}

export const VotingDurationOption = React.forwardRef(
  ({isChecked, ...props}, ref) => (
    <Button
      ref={ref}
      isActive={isChecked}
      aria-checked={isChecked}
      role="radio"
      bg="white"
      color="muted"
      fontWeight={500}
      size="sm"
      fontSize="md"
      _active={{bg: 'gray.50', color: 'brand.blue'}}
      _hover={{bg: 'gray.50', color: 'brand.blue'}}
      {...props}
    />
  )
)
VotingDurationOption.displayName = 'VotingDurationOption'
