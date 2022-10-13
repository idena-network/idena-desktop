/* eslint-disable react/prop-types */
import {Center, HStack, Stack, Text} from '@chakra-ui/react'
import React from 'react'
import {useTimer} from '../../../shared/hooks/use-timer'

export function ValidationCountdown({duration}) {
  const [{remainingSeconds}, {reset}] = useTimer(duration)

  React.useEffect(() => {
    reset(duration)
  }, [duration, reset])

  return (
    <HStack spacing="3">
      <CountdownItem value={Math.floor(remainingSeconds / 60)} unit="minutes" />
      <CountdownItem value={Math.floor(remainingSeconds % 60)} unit="seconds" />
    </HStack>
  )
}

function CountdownItem({value, unit, ...props}) {
  return (
    <Stack spacing="3" align="center" {...props}>
      <Center
        bg="gray.500"
        borderRadius="lg"
        fontSize="2xl"
        fontWeight={500}
        w="20"
        h="72px"
        sx={{fontVariantNumeric: 'tabular-nums'}}
      >
        {String(Math.max(value, 0)).padStart(2, '0')}
      </Center>
      <Text as="span" color="muted" fontSize="md">
        {unit}
      </Text>
    </Stack>
  )
}
