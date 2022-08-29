/* eslint-disable react/prop-types */
import {
  Stat,
  StatLabel,
  StatNumber,
  Stack,
  Badge,
  Icon,
  Text,
  Heading,
} from '@chakra-ui/react'
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
      <StatNumber
        color="brandGray.500"
        fontSize="md"
        fontWeight={500}
        wordBreak="break-all"
      >
        {value}
      </StatNumber>
    </Stack>
  )
}

export function ContactCardBadge(props) {
  return (
    <Badge
      borderRadius="lg"
      fontWeight={500}
      px={2}
      py={1}
      alignSelf="start"
      textTransform="initial"
      {...props}
    />
  )
}

export function NoContactDataPlaceholder({children}) {
  return (
    <FillCenter as={Stack} spacing={4}>
      <Icon name="contacts" boxSize={16} color="gray.300" />
      <Text fontWeight={500} color="muted">
        {children}
      </Text>
    </FillCenter>
  )
}

export function ContactDrawerHeader({address, name, children = name}) {
  return (
    <Stack spacing={4} align="center">
      <ContactAvatar address={address} w={20} h={20} borderRadius={20} />
      <Heading
        fontSize="lg"
        fontWeight={500}
        color="brandGray.500"
        wordBreak="break-all"
      >
        {children}
      </Heading>
    </Stack>
  )
}
