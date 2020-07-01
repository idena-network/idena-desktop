/* eslint-disable no-unused-vars */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Stack, Heading, FormControl, FormLabel, useToast} from '@chakra-ui/core'
import {useInviteDispatch} from '../../../shared/providers/invite-context'
import {
  Drawer,
  DrawerHeader,
  Avatar,
  DrawerBody,
  Input,
  Toast,
} from '../../../shared/components/components'
import {PrimaryButton} from '../../../shared/components/button'

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
          color="brandGray.500"
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Invite new person')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>{children}</DrawerBody>
    </Drawer>
  )
}

// eslint-disable-next-line react/prop-types
export function SendInviteForm({onSuccess, onFail}) {
  const {t} = useTranslation()

  const toast = useToast()

  const {addInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
                title={error?.message ?? t('Something went wrong')}
                status="error"
              />
            ),
          })
          if (onFail) onFail(error)
        }
      }}
    >
      <FormControl>
        <FormLabel htmlFor="address">{t('Address')}</FormLabel>
        <Input
          id="address"
          placeholder="Send directly to given address, or skip"
        />
      </FormControl>
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
      <PrimaryButton ml="auto" type="submit" isLoading={isSubmitting}>
        {t('Create invitation')}
      </PrimaryButton>
    </Stack>
  )
}

export default SendInviteForm
