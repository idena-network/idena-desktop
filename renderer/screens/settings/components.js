/* eslint-disable react/prop-types */
import React from 'react'
import {Box, Button, FormControl, Heading, Stack} from '@chakra-ui/core'
import {FormLabel} from '../../shared/components/components'

export function SettingsFormControl({children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack isInline spacing={2} justify="space-between" align="center">
        {children}
      </Stack>
    </FormControl>
  )
}

export function SettingsFormLabel(props) {
  return (
    <FormLabel color="muted" fontWeight={400} minW={40} w={40} {...props} />
  )
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

export function SettingsLinkButton(props) {
  return (
    <Button
      variant="link"
      variantColor="blue"
      fontWeight={500}
      _hover={null}
      _active={null}
      _disabled={{
        color: 'muted',
      }}
      {...props}
    />
  )
}
