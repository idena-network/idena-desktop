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
  Divider,
  Box,
} from '@chakra-ui/core'
import {useService} from '@xstate/react'
import {useTranslation} from 'react-i18next'
import {useRouter} from 'next/router'
import {
  DrawerHeader,
  DrawerBody,
  Input,
  Avatar,
} from '../../shared/components/components'
import {VotingStatus, FactAction} from '../../shared/types'
import {rem} from '../../shared/theme'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {toLocaleDna} from '../../shared/utils/utils'

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
      <FormLabel mb={2}>{label}</FormLabel>
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

export function VotingStatusBadge({status, ...props}) {
  const accentColors = (() => {
    switch (status) {
      case VotingStatus.Open:
        return {
          bg: 'green.020',
          color: 'green.500',
        }
      case VotingStatus.Voted:
        return {
          bg: 'blue.020',
          color: 'blue.500',
        }
      case VotingStatus.Mining:
        return {
          bg: 'orange.020',
          color: 'orange.500',
        }
      case VotingStatus.Counting:
        return {
          bg: 'red.020',
          color: 'red.500',
        }
      default:
      case VotingStatus.Archive:
        return {
          bg: 'gray.300',
          color: 'muted',
        }
    }
  })()

  return (
    <Badge
      {...accentColors}
      display="flex"
      alignItems="center"
      borderRadius="xl"
      fontSize="sm"
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
      bg={action === FactAction.Confirm ? 'blue.012' : 'gray.50'}
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

export function VotingCardItem({votingRef}) {
  const router = useRouter()
  const {t, i18n} = useTranslation()

  const [current] = useService(votingRef)

  const {
    id,
    title,
    desc,
    issuer,
    status,
    finishDate,
    totalPrize,
    votesCount,
  } = current.context

  const toDna = toLocaleDna(i18n.language)

  return (
    <Box key={id}>
      <Stack isInline spacing={2} mb={3} align="center">
        <VotingStatusBadge status={status}>{t(status)}</VotingStatusBadge>
        <Stack
          isInline
          spacing={1}
          align="center"
          bg="gray.300"
          borderRadius="xl"
          color="muted"
          fontSize="sm"
          fontWeight={500}
          h={6}
          pl="1/2"
          pr={3}
        >
          <Avatar w={5} h={5} address={issuer} />
          <Text>{issuer}</Text>
        </Stack>
      </Stack>
      <Text fontSize={rem(16)} fontWeight={500} mb={2}>
        {title}
      </Text>
      <Text color="muted" mb={4}>
        {desc}
      </Text>
      {[VotingStatus.Archive, VotingStatus.Counting].some(
        s => s === status
      ) && (
        <Stack spacing={2} mb={6}>
          <Text color="muted" fontSize="sm">
            {t('Results')}
          </Text>
          <VotingResultBar action={FactAction.Confirm} value={60} />
          <VotingResultBar action={FactAction.Reject} value={40} />
        </Stack>
      )}
      <Stack isInline spacing={2} align="center" mb={6}>
        <Icon name="star" size={4} color="white" />
        <Text fontWeight={500}>
          {t('Total prize')}: {toDna(totalPrize || 0)}
        </Text>
      </Stack>
      <Flex justify="space-between" align="center">
        <Stack isInline spacing={2}>
          <PrimaryButton onClick={() => router.push('/oracles/vote')}>
            {t('Change')}
          </PrimaryButton>
          <SecondaryButton>{t('Add fund')}</SecondaryButton>
        </Stack>
        <Stack isInline spacing={3}>
          <Text>
            <Text as="span" color="muted">
              {t('Deadline')}:
            </Text>{' '}
            <Text as="span">{new Date(finishDate).toLocaleDateString()}</Text>
          </Text>
          <Divider
            orientation="vertical"
            borderColor="gray.300"
            borderLeft="1px"
          />
          <Stack isInline spacing={2} align="center">
            <Icon name="user" w={4} h={4} />
            <Text as="span">{votesCount || 0} votes</Text>
          </Stack>
        </Stack>
      </Flex>
      <Divider borderColor="gray.300" mt={rem(28)} />
    </Box>
  )
}
