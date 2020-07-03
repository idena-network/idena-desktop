import React from 'react'
import {FormControl, Heading, Stack, useToast, Text} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {PrimaryButton} from '../../../shared/components/button'
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerHeader,
  FormLabel,
  Input,
  Toast,
} from '../../../shared/components/components'
import {
  useIdentityDispatch,
  useIdentityState,
} from '../../../shared/providers/identity-context'

// eslint-disable-next-line react/prop-types
export function KillIdentityDrawer({address, children, ...props}) {
  const {t} = useTranslation()
  return (
    <Drawer {...props}>
      <DrawerHeader mb={6}>
        <Avatar address={address} mx="auto" />
        <Heading
          fontSize="lg"
          fontWeight={500}
          color="brandGray.500"
          mt={4}
          mb={0}
          textAlign="center"
        >
          {t('Terminate identity')}
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mb={6}>
          {t(`Terminate your identity and withdraw the stake. Your identity status
            will be reset to 'Not validated'.`)}
        </Text>
        {children}
      </DrawerBody>
    </Drawer>
  )
}

// eslint-disable-next-line react/prop-types
function KillForm({onSuccess, onFail}) {
  const {t} = useTranslation()

  const toast = useToast()

  const {stake} = useIdentityState()
  const {killMe} = useIdentityDispatch()

  const [submitting, setSubmitting] = React.useState(false)

  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={async e => {
        e.preventDefault()
        try {
          setSubmitting(true)

          const {result, error} = await killMe({to: e.target.elements.to.value})

          setSubmitting(false)

          if (error) {
            toast({
              // eslint-disable-next-line react/display-name
              render: () => (
                <Toast
                  title={t('error:Error while sending transaction')}
                  description={error.message}
                  status="error"
                />
              ),
            })
          } else {
            toast({
              status: 'success',
              // eslint-disable-next-line react/display-name
              render: () => <Toast title={t('Transaction sent')} />,
            })
            if (onSuccess) onSuccess(result)
          }
        } catch (error) {
          setSubmitting(false)
          toast({
            // eslint-disable-next-line react/display-name
            render: () => (
              <Toast
                title={t('error:Something went wrong')}
                description={error.message}
                status="error"
              />
            ),
          })
          if (onFail) onFail(error)
        }
      }}
    >
      <FormControl>
        <FormLabel htmlFor="stake">{t('Withraw stake, DNA')}</FormLabel>
        <Input
          id="stake"
          value={stake}
          isDisabled
          _disabled={{
            bg: 'gray.50',
          }}
        />
      </FormControl>

      <FormControl>
        <FormLabel htmlFor="to">{t('To address')}</FormLabel>
        <Input id="to" placeholder={t('To address')} />
      </FormControl>

      <PrimaryButton
        ml="auto"
        type="submit"
        isLoading={submitting}
        variantColor="red"
        _hover={{
          bg: 'rgb(227 60 60)',
        }}
        _active={{
          bg: 'rgb(227 60 60)',
        }}
        _focus={{
          boxShadow: '0 0 0 3px rgb(255 102 102 /0.50)',
        }}
      >
        {t('Terminate')}
      </PrimaryButton>
    </Stack>
  )
}

export default KillForm
