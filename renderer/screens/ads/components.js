/* eslint-disable react/prop-types */
import React, {forwardRef} from 'react'
import NextLink from 'next/link'
import {
  Box,
  Flex,
  Stack,
  StackDivider,
  StatLabel,
  StatNumber,
  FormControl,
  Heading,
  Tab,
  NumberInputField,
  NumberInput,
  useTab,
  Button,
  CloseButton,
  HStack,
  AspectRatio,
  Image,
  InputRightElement,
  InputGroup,
  Center,
  Text,
  FormErrorMessage,
  FormErrorIcon,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {rem} from '../../shared/theme'
import {FormLabel, HDivider, Skeleton} from '../../shared/components/components'
import {omit, pick} from '../../shared/utils/utils'
import {adFallbackSrc, calculateTargetParamWeight} from './utils'

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
  return (
    <Stack
      spacing="8"
      divider={<StackDivider borderColor="gray.300" />}
      {...props}
    />
  )
}

export function EmptyAdList({children}) {
  const {t} = useTranslation()

  return (
    <Center color="muted" flex={1} w="full">
      <Stack spacing="4" align="center">
        <Text>{children}</Text>
        <NextLink href="/adn/new">
          <Button
            variant="outline"
            borderColor="gray.100"
            _hover={{
              bg: 'gray.300',
            }}
          >
            {t('Create a new ad')}
          </Button>
        </NextLink>
      </Stack>
    </Center>
  )
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

export function FormSection(props) {
  return <Box {...props} />
}

export function FormSectionTitle(props) {
  return (
    <Heading
      as="h3"
      pt="2"
      pb="3"
      mb={2}
      fontSize="mdx"
      fontWeight={500}
      lineHeight="5"
      {...props}
    />
  )
}

export function AdFormField({label, children, maybeError, ...props}) {
  return (
    <FormControl isInvalid={Boolean(maybeError)} {...props}>
      <Flex>
        <FormLabel color="muted" w="32" pt={2}>
          {label}
        </FormLabel>
        <Box w="sm">
          {children}
          <AdFormError>{maybeError}</AdFormError>
        </Box>
      </Flex>
    </FormControl>
  )
}

export function AdFormError({children, ...props}) {
  return (
    <FormErrorMessage {...props}>
      <FormErrorIcon />
      {children}
    </FormErrorMessage>
  )
}

export function AdNumberInput({addon, ...props}) {
  return (
    <NumberInput {...props}>
      {addon ? (
        <InputGroup>
          <NumberInputField />
          <InputRightElement color="muted" right="3">
            {addon}
          </InputRightElement>
        </InputGroup>
      ) : (
        <NumberInputField />
      )}
    </NumberInput>
  )
}

// eslint-disable-next-line react/display-name
export const NewAdFormTab = React.forwardRef((props, ref) => {
  const tabProps = useTab({...props, ref})
  const isSelected = Boolean(tabProps['aria-selected'])

  return <Button variant="tab" isActive={isSelected} {...tabProps} />
})

export function PageHeader(props) {
  return (
    <Flex
      as="header"
      justify="space-between"
      align="center"
      alignSelf="stretch"
      mb={4}
      {...props}
    />
  )
}

export function PageCloseButton({href, ...props}) {
  return (
    <NextLink href={href}>
      <CloseButton {...props} />
    </NextLink>
  )
}

export function PageFooter(props) {
  return (
    <HStack
      as="footer"
      spacing={2}
      justify="flex-end"
      bg="white"
      borderTop="1px"
      borderTopColor="gray.100"
      px={4}
      py={3}
      h={14}
      w="full"
      {...props}
    />
  )
}

export function AdImage({
  src: initialSrc,
  fallbackSrc = adFallbackSrc,
  objectFit = 'contain',
  ...props
}) {
  const boxProps = pick(props, ['w', 'width', 'h', 'height', 'boxSize'])
  const imageProps = omit(props, Object.keys(boxProps))

  const [src, setSrc] = React.useState()

  React.useEffect(() => {
    setSrc(initialSrc)
  }, [initialSrc])

  const isFallbackSrc = src === fallbackSrc

  return (
    <AspectRatio
      ratio={1}
      flexShrink={0}
      objectFit={objectFit}
      sx={{
        '& > img': {
          objectFit,
        },
      }}
      position="relative"
      rounded="lg"
      // borderWidth={1}
      // borderColor="gray.016"
      overflow="hidden"
      {...boxProps}
    >
      <>
        {isFallbackSrc || (
          <Box position="relative" filter="blur(20px)">
            <Image
              src={src}
              ignoreFallback
              objectFit="cover"
              onError={() => {
                setSrc(fallbackSrc)
              }}
              h="full"
              w="full"
              position="absolute"
              inset={0}
              zIndex="hide"
            />
          </Box>
        )}
        <Image
          src={src}
          ignoreFallback
          objectFit={objectFit}
          bg={isFallbackSrc ? 'gray.50' : 'transparent'}
          onError={() => {
            setSrc(fallbackSrc)
          }}
          {...imageProps}
        />
      </>
    </AspectRatio>
  )
}

export function InputCharacterCount(props) {
  return (
    <InputRightElement
      color="muted"
      fontSize="sm"
      boxSize="fit-content"
      top="unset"
      right="2"
      bottom="1.5"
      {...props}
    />
  )
}

export function LoadingAdList() {
  return (
    <Stack spacing={4} my="8" w="full" divider={<HDivider />}>
      {[...Array(5)].map((_, idx) => (
        <AdListItemSkeleton key={idx} />
      ))}
    </Stack>
  )
}

function AdListItemSkeleton() {
  return (
    <HStack spacing="5" align="flex-start">
      <SkeletonCircle
        size="60px"
        startColor="gray.50"
        endColor="gray.100"
        flexShrink={0}
      />
      <Stack spacing="5" w="full">
        <Stack spacing="1">
          <Skeleton minH="4" w="44" />
          <Skeleton minH="10" w="md" />
        </Stack>
        <SkeletonText
          noOfLines={3}
          spacing="1.5"
          startColor="gray.50"
          endColor="gray.100"
          minH="4"
        />
      </Stack>
    </HStack>
  )
}

export function AdOfferTargetingTooltip({ad}) {
  const {t} = useTranslation()

  const isTargeted = React.useMemo(
    () =>
      Object.values({
        language: ad.language,
        os: ad.os,
        age: ad.age,
        stake: ad.stake,
      }).some(Boolean),
    [ad]
  )

  return isTargeted ? (
    <Stack>
      <AdOfferTargetingTooltipItem
        label={t('Language')}
        value={ad.language || 'Any'}
        coefficient={calculateTargetParamWeight(ad.language, 22)}
      />
      <AdOfferTargetingTooltipItem
        label={t('OS')}
        value={ad.os || 'Any'}
        coefficient={calculateTargetParamWeight(ad.os, 5)}
      />
      <AdOfferTargetingTooltipItem
        label={t('Age')}
        value={ad.age || 'Any'}
        coefficient={1}
      />
      <AdOfferTargetingTooltipItem
        label={t('Stake')}
        value={ad.stake || 'Any'}
        coefficient={1}
      />
    </Stack>
  ) : (
    <Stack>
      <AdOfferTargetingTooltipItem
        label={t('Language')}
        value="Any"
        coefficient={1}
      />
      <AdOfferTargetingTooltipItem
        label={t('OS')}
        value="Any"
        coefficient={1}
      />
      <AdOfferTargetingTooltipItem
        label={t('Age')}
        value="Any"
        coefficient={1}
      />
      <AdOfferTargetingTooltipItem
        label={t('Stake')}
        value="Any"
        coefficient={1}
      />
    </Stack>
  )
}

function AdOfferTargetingTooltipItem({label, value, coefficient}) {
  return (
    <HStack>
      <Text color="muted" w="16">
        {label}
      </Text>
      <Text w="14">{value}</Text>
      <Text>x{coefficient}</Text>
    </HStack>
  )
}
