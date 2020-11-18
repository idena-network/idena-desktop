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
  Text,
  Box,
  Skeleton,
  useTheme,
  Divider,
  InputGroup,
  InputRightAddon,
  Button,
  IconButton,
  RadioButtonGroup,
  Collapse,
  useDisclosure,
} from '@chakra-ui/core'
import {
  DrawerHeader,
  DrawerBody,
  Input,
  HDivider,
} from '../../shared/components/components'

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
      <OracleFormHelperValue {...props}>{value}</OracleFormHelperValue>
    </Flex>
  )
}

export function OracleFormHelperText(props) {
  return <FormHelperText color="muted" fontSize="md" {...props} />
}

export function OracleFormHelperValue(props) {
  return <FormHelperText color="brandGray.500" fontSize="md" {...props} />
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

export function VotingInlineFormControl({htmlFor, label, children, ...props}) {
  return (
    <FormControl display="inline-flex" {...props}>
      <FormLabel htmlFor={htmlFor} color="muted" py={2} minW={32} w={32}>
        {label}
      </FormLabel>
      {children}
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

export function PercentInput(props) {
  return (
    <InputWithRightAddon addon="%" type="number" min={0} max={100} {...props} />
  )
}

export function InputWithRightAddon({
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
    <InputGroup size={size} flex={1}>
      <Input
        borderRightColor={bg}
        borderTopRightRadius={0}
        borderBottomRightRadius={0}
        isDisabled={isDisabled}
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
      <HDivider mt={6} mb={0} />
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

export const VotingOption = React.forwardRef(
  ({value, annotation, children = value, ...props}, ref) => (
    <Flex
      justify="space-between"
      border="1px"
      borderColor="gray.300"
      borderRadius="md"
      px={3}
      py={2}
    >
      <Radio
        isTruncated
        ref={ref}
        borderColor="gray.100"
        value={value}
        title={children.length > 50 ? children : ''}
        maxW="xs"
        {...props}
      >
        {children}
      </Radio>
      <Text color="muted" fontSize="sm">
        {annotation}
      </Text>
    </Flex>
  )
)
VotingOption.displayName = 'VotingOption'

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

export function NewOracleFormHelperText(props) {
  return <OracleFormHelperText fontSize="sm" {...props} />
}

export function NewVotingFormSubtitle(props) {
  return <Heading as="h2" fontSize="base" fontWeight={500} mt={4} {...props} />
}

export function TaggedInput({
  id,
  type,
  value,
  min,
  max,
  presets = [],
  helperText,
  customText,
  onChangePreset,
  onChangeCustom,
  ...props
}) {
  const {isOpen, onToggle} = useDisclosure()
  return (
    <VotingInlineFormControl {...props}>
      <Stack flex={1}>
        <Stack isInline justify="space-between">
          <RadioButtonGroup isInline value={value} onChange={onChangePreset}>
            {/* eslint-disable-next-line no-shadow */}
            {presets.map(({value, label}) => (
              <TagOption key={label} value={value}>
                {label}
              </TagOption>
            ))}
          </RadioButtonGroup>
          <Button
            variant="link"
            color="muted"
            fontWeight={500}
            _hover={{
              textDecoration: 'none',
            }}
            _active={{}}
            _focus={{}}
            onClick={onToggle}
          >
            {customText}
          </Button>
        </Stack>
        <Collapse isOpen={isOpen}>
          <Input
            id={id}
            type={type}
            value={value}
            min={min}
            max={max}
            onChange={onChangeCustom}
          />
          <NewOracleFormHelperText textAlign="right">
            {helperText}
          </NewOracleFormHelperText>
        </Collapse>
      </Stack>
    </VotingInlineFormControl>
  )
}

const TagOption = React.forwardRef(({isChecked, ...props}, ref) => (
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
))
TagOption.displayName = 'TagOption'

export const OutlineButton = React.forwardRef((props, ref) => (
  <Button
    ref={ref}
    bg="unset"
    borderColor="gray.100"
    borderWidth="1px"
    borderRadius="lg"
    fontWeight={500}
    px={4}
    h={8}
    _hover={{
      bg: 'gray.50',
    }}
    _active={{
      bg: 'gray.50',
    }}
    _disabled={{
      bg: 'gray.50',
    }}
    {...props}
  />
))
OutlineButton.displayName = 'OutlineButton'

export function ScrollToTop({scrollableRef, children, ...props}) {
  const [opacity, setOpacity] = React.useState(0)
  const lastOpacity = React.useRef(Number.EPSILON)

  const scrollableElement = scrollableRef.current

  React.useEffect(() => {
    const handleScroll = e => {
      const prevOpacity = lastOpacity.current
      const nextOpacity = Math.min(
        Math.round((e.target.scrollTop / 2000) * 100),
        100
      )

      if (Math.abs(nextOpacity - prevOpacity) > 10) {
        setOpacity(nextOpacity < 11 ? 0 : nextOpacity / 100)
        lastOpacity.current = nextOpacity
      }
    }

    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', handleScroll)
      return () => {
        scrollableElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [scrollableElement])

  return (
    <Button
      variant="unstyled"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      position="absolute"
      bottom={4}
      right={4}
      borderRadius="lg"
      boxShadow="md"
      h={8}
      minH={8}
      minW={8}
      p={4}
      py={0}
      opacity={opacity}
      _focus={{
        boxShadow: 'md',
      }}
      onClick={() => {
        scrollableElement.scrollTo({top: 0, left: 0, behavior: 'smooth'})
      }}
      {...props}
    >
      <Stack isInline spacing={1} align="center">
        <Icon name="arrow-up" size={5} />
        <Text as="span">{children}</Text>
      </Stack>
    </Button>
  )
}

export function SmallText(props) {
  return <Text color="muted" fontSize="sm" {...props} />
}
