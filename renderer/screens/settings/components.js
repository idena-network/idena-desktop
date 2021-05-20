/* eslint-disable react/prop-types */
import React from 'react'
import {Box, FormControl, Heading, Stack} from '@chakra-ui/core'
import {FormLabel, Input} from '../../shared/components/components'

export function SettingsFormControl({children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack isInline spacing={2} justify="space-between" align="center" w="md">
        {children}
      </Stack>
    </FormControl>
  )
}

export function SettingsFormLabel(props) {
  return <FormLabel color="muted" fontWeight={400} {...props} />
}

export function SettingsInput(props) {
  return <Input w="xs" {...props} />
}

export function SettingsSection({title, children, ...props}) {
  return (
    <Box {...props}>
      <Heading fontWeight={500} fontSize="lg" mb={5}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

export function DevSettingsSection(props) {
  return global.isDev ? <SettingsSection {...props} /> : null
}
