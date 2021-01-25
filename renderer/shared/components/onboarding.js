/* eslint-disable react/prop-types */
import React from 'react'
import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  Stack,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'

export function OnboardingPopover({children, ...props}) {
  return (
    <>
      {/* eslint-disable-next-line react/destructuring-assignment */}
      {props.isOpen && (
        <Box
          bg="xblack.080"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={2}
        />
      )}
      <Popover {...props}>{children}</Popover>
    </>
  )
}

export function OnboardingPopoverContent({
  title,
  children,
  onDismiss,
  ...props
}) {
  const {t} = useTranslation()

  return (
    <PopoverContent
      bg="blue.500"
      border="none"
      color="white"
      px={3}
      py={2}
      {...props}
    >
      <PopoverArrow />
      <Stack spacing={3}>
        <PopoverHeader borderBottom="none" fontWeight={500} p={0}>
          {title}
        </PopoverHeader>
        <PopoverBody fontSize="sm" p={0}>
          {children}
        </PopoverBody>
        <PopoverFooter border="none" p={0} display="inline-flex">
          <Button variant="unstyled" ml="auto" onClick={onDismiss}>
            {t('Okay, got it')}
          </Button>
        </PopoverFooter>
      </Stack>
    </PopoverContent>
  )
}
