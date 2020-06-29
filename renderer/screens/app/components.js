/* eslint-disable react/prop-types */
import {Flex, Heading, FormControl, FormLabel, Stack} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  Input,
  DrawerHeader,
  DrawerBody,
  Drawer,
  Avatar,
} from '../../shared/components/components'
import {PrimaryButton} from '../../shared/components/button'

export function LayoutContainer(props) {
  return (
    <Flex
      align="stretch"
      flexWrap="wrap"
      color="brand.gray"
      fontSize="md"
      minH="100vh"
      {...props}
    />
  )
}

export function Page(props) {
  return (
    <Flex
      flexDirection="column"
      align="flex-start"
      flexBasis={0}
      flexGrow={999}
      maxH="100vh"
      minW="50%"
      px={20}
      py={6}
      overflowY="auto"
      {...props}
    />
  )
}

export function PageTitle(props) {
  return (
    <Heading as="h1" fontSize="xl" fontWeight={500} py={2} mb={4} {...props} />
  )
}

export function IssueInviteDrawer({children, ...props}) {
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

export function IssueInviteForm({onIssueInvite}) {
  const {t} = useTranslation()
  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={e => {
        const {
          address: {value: address},
          firstName: {value: firstName},
          lastName: {value: lastName},
        } = e.target.elements
        onIssueInvite({address, firstName, lastName})
        e.preventDefault()
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
      <PrimaryButton ml="auto" type="submit">
        {t('Create invitation')}
      </PrimaryButton>
    </Stack>
  )
}
