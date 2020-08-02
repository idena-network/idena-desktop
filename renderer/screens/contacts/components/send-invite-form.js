/* eslint-disable no-unused-vars */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Stack,
  Heading,
  FormControl,
  FormLabel,
  useToast,
  Collapse,
  Box,
  Button,
  useDisclosure,
  Icon,
  Text,
  useColorMode,
} from '@chakra-ui/core'
import theme from '../../../shared/theme'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {
  Drawer,
  DrawerHeader,
  Avatar,
  DrawerBody,
  Input,
  Toast,
} from '../../../shared/components/components'
import {PrimaryButton, IconButton2} from '../../../shared/components/button'

// eslint-disable-next-line react/prop-types
export function SendInviteDrawer({children, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={`0x${'2'.repeat(64)}`} mx="auto" />
        <Heading
          fontSize="lg"
          fontWeight={500}
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Invite new person')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mb={6}>
          {t(
            `You can issue the invitation to the specific identity address in Advanced section`
          )}
        </Text>
        {children}
      </DrawerBody>
    </Drawer>
  )
}

// eslint-disable-next-line react/prop-types
export function SendInviteForm({onSuccess, onFail}) {
  const {t} = useTranslation()

  const toast = useToast()

  const {
    isOpen: isOpenAdvancedOptions,
    onToggle: onToggleAdvancedOptions,
  } = useDisclosure()

  const {addInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {colorMode} = useColorMode()

  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={async e => {
        e.preventDefault()

        const {
          address: {value: address},
          firstName: {value: firstName},
          lastName: {value: lastName},
        } = e.target.elements

        try {
          setIsSubmitting(true)

          const invite = await addInvite(address, null, firstName, lastName)

          setIsSubmitting(false)

          toast({
            // eslint-disable-next-line react/display-name
            render: () => (
              <Toast
                bg={colorMode === 'light' ? 'white' : 'black'}
                color={theme.colors[colorMode].text}
                title={t('Invitation code created')}
                description={invite.hash}
              />
            ),
          })

          if (onSuccess) onSuccess(invite)
        } catch (error) {
          setIsSubmitting(false)
          toast({
            // eslint-disable-next-line react/display-name
            render: () => (
              <Toast
                bg={colorMode === 'light' ? 'white' : 'black'}
                color={theme.colors[colorMode].text}
                title={error?.message ?? t('Something went wrong')}
                status="error"
              />
            ),
          })
          if (onFail) onFail(error)
        }
      }}
    >
      <Stack isInline spacing={4}>
        <FormControl>
          <FormLabel htmlFor="firstName">{t('First name')}</FormLabel>
          <Input id="firstName" />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="lastName">{t('Last name')}</FormLabel>
          <Input id="lastName" />
        </FormControl>
      </Stack>
      <Box>
        <Button
          background="transparent"
          px={0}
          _hover={{background: 'transparent'}}
          _active={{background: 'transparent'}}
          _focus={{outline: 'none'}}
          onClick={onToggleAdvancedOptions}
        >
          {t('Advanced')}
          <Icon
            size={5}
            name="chevron-down"
            color="muted"
            ml={2}
            transform={isOpenAdvancedOptions ? 'rotate(180deg)' : ''}
            transition="all 0.2s ease-in-out"
          />
        </Button>
        <Collapse isOpen={isOpenAdvancedOptions} mt={4}>
          <FormControl>
            <FormLabel htmlFor="address">{t('Address')}</FormLabel>
            <Input id="address" placeholder="Invitee address" />
          </FormControl>
        </Collapse>
      </Box>
      <PrimaryButton ml="auto" type="submit" isLoading={isSubmitting}>
        {t('Create invitation')}
      </PrimaryButton>
    </Stack>
  )
}

export default SendInviteForm
