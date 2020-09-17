/* eslint-disable react/prop-types */
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

export function SettingsSection({title, ...props}) {
  return (
    <Box mb={10}>
      <Heading fontWeight={500} fontSize="lg" mb={4}>
        {title}
      </Heading>
      <Box {...props} />
    </Box>
  )
}
