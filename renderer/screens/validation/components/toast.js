/* eslint-disable react/prop-types */
import {Alert, AlertTitle, Flex} from '@chakra-ui/react'
import {InfoIcon} from '../../../shared/components/icons'

export function ValidatonStatusToast({title, children, ...options}) {
  return (
    <Alert variant="validation" {...options}>
      <InfoIcon w="5" h="5" marginEnd="3" />
      <Flex justify="space-between" align="center">
        <AlertTitle>{title}</AlertTitle>
        {children}
      </Flex>
    </Alert>
  )
}
