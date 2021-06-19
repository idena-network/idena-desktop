/* eslint-disable react/prop-types */
import {Stat, StatLabel, StatNumber, Stack} from '@chakra-ui/core'
import {Avatar} from '../../shared/components/components'
import {dummyAddress} from '../../shared/utils/utils'

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
