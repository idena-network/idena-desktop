/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  Box,
  Stack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
} from '@chakra-ui/react'
import {Avatar, Dialog} from '../../shared/components/components'

export function DnaDialog(props) {
  return <Dialog closeOnOverlayClick={false} closeOnEsc={false} {...props} />
}

export function DnaDialogAlert({children, ...props}) {
  return (
    <Stack
      isInline
      align="center"
      bg="red.020"
      borderColor="red.500"
      borderWidth={1}
      borderRadius="md"
      px={3}
      py={2}
      {...props}
    >
      <Icon name="info" size={4} color="red.500" />
      <Text fontWeight={500}>{children}</Text>
    </Stack>
  )
}

export function DnaDialogAlertText(props) {
  return (
    <Box color="red.500" fontWeight={500} fontSize="sm" mt={1} {...props} />
  )
}

export function DnaDialogAvatar({address}) {
  return (
    <Avatar
      address={address}
      size={10}
      bg="white"
      borderRadius="md"
      borderWidth={1}
      borderColor="brandGray.016"
    />
  )
}

export function SimpleDnaDialogStat({label, value, ...props}) {
  return (
    <DnaDialogStat {...props}>
      <DnaDialogStatLabel>{label}</DnaDialogStatLabel>
      <DnaDialogStatValue>{value}</DnaDialogStatValue>
    </DnaDialogStat>
  )
}

export function MediaDnaDialogStat({label, value, children, ...props}) {
  return (
    <Stack
      isInline
      spacing={4}
      align="center"
      bg="gray.50"
      px={5}
      py={4}
      {...props}
    >
      <Stat p={0}>
        <DnaDialogStatLabel>{label}</DnaDialogStatLabel>
        <DnaDialogStatValue>{value}</DnaDialogStatValue>
      </Stat>
      {children}
    </Stack>
  )
}

export function DnaDialogStat(props) {
  return <Stat bg="gray.50" px={5} py={4} {...props} />
}

export function DnaDialogStatLabel(props) {
  return <StatLabel color="muted" fontSize="md" {...props} />
}

export function DnaDialogStatValue(props) {
  return (
    <StatNumber
      fontSize="md"
      fontWeight={500}
      wordBreak="break-all"
      {...props}
    />
  )
}
