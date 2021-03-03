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
  Portal,
  Stack,
} from '@chakra-ui/core'
import Confetti from 'react-dom-confetti'
import {useTranslation} from 'react-i18next'

export function OnboardingPopover({children, ...props}) {
  return (
    <>
      {/* eslint-disable-next-line react/destructuring-assignment */}
      {props.isOpen && (
        <Portal>
          <Box
            bg="xblack.080"
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={2}
          />
        </Portal>
      )}
      <Popover closeOnBlur={false} usePortal {...props}>
        {children}
      </Popover>
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
      zIndex="popover"
      {...props}
    >
      <PopoverArrow />
      <Box p={2}>
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
      </Box>
    </PopoverContent>
  )
}

export function TaskConfetti({config, ...props}) {
  return (
    <Confetti
      config={{
        angle: '70',
        spread: '35',
        startVelocity: '70',
        elementCount: '200',
        dragFriction: '0.15',
        duration: '3000',
        stagger: 4,
        width: '6px',
        height: '6px',
        perspective: '1000px',
        colors: [
          '#578fff',
          '#ff6666',
          '#27d980',
          '#ffc969',
          '#ff74e1',
          '#c08afa',
          '#8e62f5',
        ],
        ...config,
      }}
      {...props}
    />
  )
}
