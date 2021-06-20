/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  FormControl,
  Stack,
  useToast,
  Text,
  Flex,
  Button,
  useClipboard,
  Box,
  Icon,
  Heading,
  useDisclosure,
  Collapse,
  IconButton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../shared/providers/identity-context'
import {dummyAddress, toLocaleDna, toPercent} from '../../shared/utils/utils'
import {
  FormLabel,
  Input,
  Toast,
  VDivider,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Tooltip,
} from '../../shared/components/components'
import {
  useInvite,
  useInviteDispatch,
  useInviteState,
} from '../../shared/providers/invite-context'
import {PrimaryButton, IconButton2} from '../../shared/components/button'
import {ContactAvatar, ContactCardMiningBadge, ContactStat} from './components'
import {useContactState} from '../../shared/providers/contact-context'
import {SmallText} from '../oracles/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useChainState} from '../../shared/providers/chain-context'
import {calculateInvitationRewardRatio} from '../profile/utils'

export function ContactListSidebar({
  onSelectContact,
  onSelectInvite,
  onNewInvite,
}) {
  const {contacts} = useContactState()

  const [term, setTerm] = React.useState()

  React.useEffect(() => {
    if (contacts.length) {
      onSelectContact(contacts[0])
    }
  }, [contacts, onSelectContact])

  return (
    <Stack
      spacing={3}
      borderRightColor="gray.300"
      borderRightWidth="1px"
      w={240}
      h="100vh"
      overflow="hidden"
      overflowY="auto"
    >
      <Stack>
        <ContactListSearch
          onChange={e => {
            setTerm(e.target.value)
          }}
        />
        <InviteActionBar onNewInvite={onNewInvite} />
      </Stack>
      <ContactList filter={term} onSelectInvite={onSelectInvite} />
    </Stack>
  )
}

function InviteActionBar({onNewInvite, ...props}) {
  const {t} = useTranslation()

  const {invites: availableInviteCount, canInvite} = useIdentityState()

  return (
    <Flex
      align="center"
      justify="space-between"
      px={4}
      h={44}
      w="full"
      {...props}
    >
      <Stack isInline spacing={3} align="center">
        <IconButton
          icon="plus-solid"
          variantColor="blue"
          bg="blue.012"
          color="blue.500"
          fontSize="base"
          isDisabled={!canInvite}
          h={8}
          w={8}
          minW={8}
          _hover={{
            bg: 'brandBlue.20',
          }}
          _active={{
            bg: 'brandBlue.20',
          }}
          onClick={onNewInvite}
        />
        <Box fontWeight={500}>
          <Text>{t('Invite people')}</Text>
          <SmallText color="blue.500">
            {t('{{availableInviteCount}} invites left', {availableInviteCount})}
          </SmallText>
        </Box>
      </Stack>
      <InvitationRewardRatioInfo />
    </Flex>
  )
}

function ContactListSearch({onChange}) {
  const {t} = useTranslation()
  return (
    <Box p={3}>
      <Input
        type="search"
        bg="gray.50"
        placeholder={t('Search')}
        _placeholder={{
          color: 'muted',
        }}
        onChange={onChange}
      />
    </Box>
  )
}

function InvitationRewardRatioInfo() {
  const {t} = useTranslation()

  const epoch = useEpochState()
  const {highestBlock} = useChainState()

  return (
    <Tooltip
      label={t(
        'You will get {{invitationRewardRatio}} of the invitation rewards if your invite is activated now',
        {
          invitationRewardRatio: toPercent(
            calculateInvitationRewardRatio(epoch ?? {}, {
              highestBlock,
            })
          ),
        }
      )}
      placement="right-start"
      w={151}
    >
      <Icon name="info" size={5} color="blue.500" />
    </Tooltip>
  )
}

function ContactList({filter, onSelectInvite}) {
  const {t} = useTranslation()

  const {invites} = useInviteState()

  const [filteredInvites, setFilteredInvites] = React.useState([])

  React.useEffect(() => {
    if (filter && filter.length > 0) {
      // eslint-disable-next-line no-shadow
      const nextInvite = invites.filter(({firstName, lastName, receiver}) =>
        [firstName, lastName, receiver].some(x =>
          x?.toLowerCase().includes(filter.toLowerCase())
        )
      )
      setFilteredInvites(nextInvite)
    } else {
      setFilteredInvites(invites)
    }
  }, [invites, filter])

  const [selectedInviteId, setSelectedInviteId] = React.useState()

  if (filter && filteredInvites.length === 0) {
    return <Text p={4}>{t('No contacts found...')}</Text>
  }

  return (
    <Box>
      <Box color="muted" fontWeight={500} px={3} py={2}>
        {t('Contacts')}
      </Box>
      {filteredInvites
        .filter(invite => !invite.deletedAt)
        .map(invite => (
          <ContactListItem
            isActive={invite.dbkey === selectedInviteId}
            id={invite.dbkey}
            {...invite}
            state={invite.identity && invite.identity.state}
            onSelectInvite={() => {
              onSelectInvite(invite)
              setSelectedInviteId(invite.dbkey)
            }}
          />
        ))}
    </Box>
  )
}

function ContactListItem({
  receiver,
  mining,
  terminating,
  activated,
  state,
  onSelectInvite,
  isActive,
  firstName,
  lastName,
}) {
  const fullName = `${firstName} ${lastName}`.trim()

  const {t} = useTranslation()

  const hint = (() => {
    switch (true) {
      case mining:
        return t('Mining...')
      case terminating:
        return t('Terminating...')
      case activated:
        return mapToFriendlyStatus(state)
      default:
        return ''
    }
  })()

  return (
    <Stack
      isInline
      spacing={3}
      align="center"
      bg={isActive ? 'gray.50' : ''}
      h={44}
      px={4}
      cursor="pointer"
      onClick={onSelectInvite}
    >
      <ContactAvatar address={receiver} w={8} h={8} borderRadius="lg" />
      <Box fontWeight={500}>
        <Text isTruncated>{fullName || receiver}</Text>
        <SmallText color="blue.500">{hint}</SmallText>
      </Box>
    </Stack>
  )
}

export function ContactCard({
  dbkey,
  showMining,
  onEditContact,
  onRemoveContact,
  onKillContact,
}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const [{invites}, {deleteInvite}] = useInvite()

  const invite = invites && invites.find(({id}) => id === dbkey)

  const {onCopy} = useClipboard(invite?.key)

  const identity = invite?.identity
  const stake = identity?.stake

  if (!invite) {
    return null
  }

  const {
    key,
    receiver,
    address = receiver,
    firstName,
    lastName,
    canKill,
    mining,
    terminating,
    activated,
  } = invite

  const isInviteExpired =
    identity?.state === 'Undefined' && !canKill && !mining && !activated

  const state = isInviteExpired
    ? t('Expired invitation')
    : identity?.state === 'Invite'
    ? t('Invitation')
    : mining
    ? t('Mining...')
    : terminating
    ? t('Terminating...')
    : mapToFriendlyStatus(identity?.state) ?? 'Unknown'

  const toDna = toLocaleDna(language)

  return (
    <>
      <Stack spacing={6} w="full">
        <Stack spacing={4}>
          <Stack isInline spacing={6} align="center" py={2}>
            <ContactAvatar address={address} h={80} w={80} borderRadius={20} />
            <Stack spacing="3/2" fontWeight={500}>
              <Text fontSize="lg">{`${firstName} ${lastName}`}</Text>
              <Text color="muted" fontSize="mdx" wordBreak="break-all">
                {address}
              </Text>
              {showMining && <ContactCardMiningBadge isMining={mining} />}
            </Stack>
          </Stack>

          <Stack isInline align="center" spacing={1}>
            <IconButton2 icon="edit" onClick={onEditContact}>
              {t('Edit')}
            </IconButton2>
            <VDivider />
            <IconButton2
              icon="flip-editor-delete"
              onClick={() => {
                deleteInvite(dbkey)
                onRemoveContact()
              }}
            >
              {t('Delete')}
            </IconButton2>
            {canKill && (
              <>
                <VDivider />
                <IconButton2 icon="delete" onClick={onKillContact}>
                  {t('Kill')}
                </IconButton2>
              </>
            )}
          </Stack>
        </Stack>

        <Stack spacing={5} bg="gray.50" px={10} py={8} borderRadius="md">
          <Stack spacing={0}>
            <ContactStat label={t('Status')} value={state} pt={2} pb={3} />

            {identity?.state !== 'Invite' && !isInviteExpired && !mining && (
              <ContactStat label={t('Address')} value={receiver} />
            )}

            {stake > 0 && <ContactStat label="Stake" value={toDna(stake)} />}
          </Stack>

          {!isInviteExpired && !activated && (
            <FormControl>
              <Stack spacing={3}>
                <Flex align="center" justify="space-between">
                  <FormLabel pb={0}>{t('Invitation code')}</FormLabel>
                  {!activated && (
                    <Button
                      variant="link"
                      variantColor="blue"
                      fontWeight={500}
                      _hover={null}
                      _active={null}
                      onClick={onCopy}
                    >
                      {t('Copy')}
                    </Button>
                  )}
                </Flex>
                <Input label={t('Invitation code')} value={key} isDisabled />
              </Stack>
            </FormControl>
          )}
        </Stack>
      </Stack>
    </>
  )
}

export function SendInviteDrawer({onDone, onFail, ...props}) {
  const {t} = useTranslation()

  const toast = useToast()

  const {
    isOpen: isOpenAdvancedOptions,
    onToggle: onToggleAdvancedOptions,
  } = useDisclosure()

  const {addInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing={4} align="center">
          <ContactAvatar address={dummyAddress} mx="auto" borderRadius={20} />
          <Heading fontSize="lg" fontWeight={500} color="brandGray.500">
            {t('Invite new person')}
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody>
        <Text fontSize="md" mt={6}>
          {t(
            `You can issue the invitation to the specific identity address in Advanced section`
          )}
        </Text>
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

              onDone(invite)
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
              onFail(error?.message)
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
              color="brandGray.500"
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
      </DrawerBody>
    </Drawer>
  )
}
export function EditContactDrawer({contact, onDone, ...props}) {
  const {t} = useTranslation()

  const {updateInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState()

  const {id, firstName, lastName, receiver} = contact

  const contactName = `${firstName} ${lastName}`.trim() || receiver

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing={4} align="center">
          <ContactAvatar w={20} h={20} address={receiver} borderRadius={20} />
          <Heading
            fontSize="lg"
            fontWeight={500}
            color="brandGray.500"
            wordBreak="break-all"
          >
            {contactName}
          </Heading>
        </Stack>
      </DrawerHeader>
      <DrawerBody>
        <Stack isInline spacing={4} mt={5}>
          <FormControl>
            <FormLabel>{t('First name')}</FormLabel>
            <Input id="firstName" />
          </FormControl>
          <FormControl>
            <FormLabel>{t('Last name')}</FormLabel>
            <Input id="lastName" />
          </FormControl>
        </Stack>
      </DrawerBody>
      <DrawerFooter>
        <PrimaryButton
          ml="auto"
          isLoading={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true)
            await updateInvite(id, firstName, lastName)
            setIsSubmitting(false)
            onDone()
          }}
        >
          {t('Create invitation')}
        </PrimaryButton>
      </DrawerFooter>
    </Drawer>
  )
}

export function KillInviteDrawer({invite, onDone, onFail, ...props}) {
  const {t, i18n} = useTranslation()

  const {address} = useIdentityState()

  const {killInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState()

  const {id, firstName, lastName, receiver, state: status, stake} = invite

  const contactName = receiver || `${firstName} ${lastName}`.trim()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <Stack spacing={4} align="center">
          <ContactAvatar address={receiver} w={20} h={20} borderRadius={20} />
          <Heading
            fontSize="lg"
            fontWeight={500}
            color="brandGray.500"
            wordBreak="break-all"
          >
            {contactName}
          </Heading>
        </Stack>
      </DrawerHeader>
      <form
        onSubmit={async e => {
          e.preventDefault()

          setIsSubmitting(true)

          try {
            const {result, error} = await killInvite(id, address, receiver)

            setIsSubmitting(false)

            if (error) {
              onFail(error)
            } else {
              onDone(result)
            }
          } catch (error) {
            setIsSubmitting(false)
            onFail(error?.message)
          }
        }}
      >
        <DrawerBody>
          <Text mt={5}>{t('Terminate invitation')}</Text>
          <Stack spacing={6}>
            <ContactStat label={t('Status')} value={status} />
            <ContactStat
              label={t('Stake')}
              value={toLocaleDna(i18n.language)(stake)}
            />
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <PrimaryButton
            ml="auto"
            type="submit"
            isLoading={isSubmitting}
            onClick={async () => {}}
          >
            {t('Create invitation')}
          </PrimaryButton>
        </DrawerFooter>
      </form>
    </Drawer>
  )
}
