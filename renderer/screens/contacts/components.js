/* eslint-disable react/prop-types */
import {
  Stat,
  StatLabel,
  StatNumber,
  Stack,
  Badge,
  Icon,
  Text,
} from '@chakra-ui/core'
import {Avatar} from '../../shared/components/components'
import {dummyAddress} from '../../shared/utils/utils'
import {FillCenter} from '../oracles/components'

export function ContactAvatar({address = dummyAddress, ...props}) {
  return (
    <Avatar
      address={address}
      bg="white"
      borderColor="brandGray.016"
      borderWidth={1}
      {...props}
    />
  )
}

export function ContactStat({label, value}) {
  return (
    <Stack as={Stat} spacing="1/2" pt={2} pb={3}>
      <StatLabel color="muted" fontSize="md">
        {label}
      </StatLabel>
      <StatNumber fontSize="md" fontWeight={500}>
        {value}
      </StatNumber>
    </Stack>
  )
}

export function ContactCardMiningBadge({isMining, ...props}) {
  return (
    <Badge
      bg={isMining ? 'orange.012' : 'green.500'}
      color={isMining ? 'orange.500' : 'green.500'}
      p={2}
      {...props}
    />
  )
}

export function NoContactDataPlaceholder({children}) {
  return (
    <FillCenter as={Stack} spacing={4}>
      <Icon name="contacts" size={16} color="gray.300" />
      <Text fontWeight={500} color="muted">
        {children}
      </Text>
    </FillCenter>
  )
}
