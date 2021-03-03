/* eslint-disable react/prop-types */
import React from 'react'
import {
  Box,
  Button,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  Stack,
  useTheme,
} from '@chakra-ui/core'
import Confetti from 'react-dom-confetti'
import {useTranslation} from 'react-i18next'

export function OnboardingPopover({children, ...props}) {
  return (
    <>
      {/* eslint-disable-next-line react/destructuring-assignment */}
      {props.isOpen && (
        <Box
          bg="xblack.080"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={2}
        />
      )}
      <Popover closeOnBlur={false} usePortal {...props}>
        {children}
      </Popover>
    </>
  )
}

export function OnboardingPopoverContent({
  title,
  additionFooterActions,
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
          <PopoverHeader
            borderBottom="none"
            fontWeight={500}
            fontSize="md"
            p={0}
            mb={0}
          >
            {title}
          </PopoverHeader>
          <PopoverBody fontSize="sm" p={0}>
            {children}
          </PopoverBody>
          <PopoverFooter as={Stack} border="none" p={0}>
            <Stack isInline spacing={6} justify="flex-end">
              {additionFooterActions}
              <Button variant="unstyled" onClick={onDismiss}>
                {t('Okay, got it')}
              </Button>
            </Stack>
          </PopoverFooter>
        </Stack>
      </Box>
    </PopoverContent>
  )
}

export function OnboardingPopoverContentIconRow({icon, children, ...props}) {
  return (
    <Stack isInline spacing={4} align="center" {...props}>
      {typeof icon === 'string' ? (
        <Icon name={icon} size={5} />
      ) : (
        <Box>{icon}</Box>
      )}
      <Box color="white">{children}</Box>
    </Stack>
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

export function OnboardingLinkButton({href, ...props}) {
  const {colors} = useTheme()
  return (
    <Button
      variant="link"
      color="white"
      fontSize="sm"
      fontWeight="normal"
      verticalAlign="baseline"
      textDecoration={`underline ${colors.xwhite['040']}`}
      minW={0}
      _hover={null}
      _active={null}
      _focus={null}
      onClick={() => {
        global.openExternal(href)
      }}
      {...props}
    />
  )
}
