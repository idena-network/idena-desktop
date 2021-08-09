/* eslint-disable no-nested-ternary */
/* eslint-disable react/prop-types */
import * as React from 'react'
import {
  FormControl,
  Stack,
  Text,
  Flex,
  Button,
  useClipboard,
  Box,
  Icon,
  useDisclosure,
  Collapse,
  IconButton,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../shared/providers/identity-context'
import {
  byId,
  calculateInvitationRewardRatio,
  dummyAddress,
  toLocaleDna,
  toPercent,
} from '../../shared/utils/utils'
import {
  FormLabel,
  Input,
  VDivider,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Tooltip,
  SmallText,
} from '../../shared/components/components'
import {
  useInvite,
  useInviteDispatch,
  useInviteState,
} from '../../shared/providers/invite-context'
import {PrimaryButton, IconButton2} from '../../shared/components/button'
import {
  ContactAvatar,
  ContactCardBadge,
  ContactDrawerHeader,
  ContactStat,
} from './components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useChainState} from '../../shared/providers/chain-context'
import {useSuccessToast} from '../../shared/hooks/use-toast'
import {IdentityStatus} from '../../shared/types'
import {VotingSkeleton} from '../oracles/components'

export function ContactListSidebar({
  selectedContactId,
  onSelectContact,
  onNewContact,
}) {
  const {t} = useTranslation()

  const [term, setTerm] = React.useState()

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
      <Stack spacing={0}>
        <Box p={3}>
          <Input
            type="search"
            bg="gray.50"
            placeholder={t('Search')}
            _placeholder={{
              color: 'muted',
            }}
            onChange={e => setTerm(e.target.value)}
          />
        </Box>
        <InviteActionBar onNewContact={onNewContact} />
      </Stack>
      <ContactList
        filter={term}
        selectedContactId={selectedContactId}
        onSelectContact={onSelectContact}
      />
    </Stack>
  )
}

function InviteActionBar({onNewContact}) {
  const {t} = useTranslation()

  const {invites: availableInviteCount, canInvite} = useIdentityState()

  return (
    <Flex align="center" justify="space-between" px={4} py="3/2" w="full">
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
          onClick={onNewContact}
        />
        <Box fontWeight={500}>
          <Text lineHeight="shorter">{t('Invite people')}</Text>
          <SmallText color="blue.500" lineHeight={14 / 11}>
            {t('{{availableInviteCount}} invites left', {availableInviteCount})}
          </SmallText>
        </Box>
      </Stack>
      <InvitationRewardRatioInfo />
    </Flex>
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
      placement="right"
      w={151}
    >
      <Icon name="info" size={5} color="blue.500" />
    </Tooltip>
  )
}

function ContactList({filter, selectedContactId, onSelectContact}) {
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

  if (filter && filteredInvites.length === 0) {
    return <Text p={4}>{t('No contacts found...')}</Text>
  }

  return (
    <Box>
      <Box color="muted" fontWeight={500} px={3} py={2}>
        {t('Contacts')}
      </Box>
      {filteredInvites.length === 0 && (
        <Stack px={4}>
          {[...Array(10)].map(() => (
            <VotingSkeleton h={6} />
          ))}
        </Stack>
      )}
      {filteredInvites
        .filter(invite => !invite.deletedAt)
        .map(invite => (
          <ContactListItem
            key={invite.id}
            isActive={(invite.dbkey || invite.id) === selectedContactId}
            id={invite.dbkey || invite.id}
            {...invite}
            state={invite.identity?.state}
            onClick={() => {
              onSelectContact(invite)
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
  isActive,
  firstName,
  lastName,
  ...props
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
      {...props}
    >
      <ContactAvatar address={receiver} w={8} h={8} borderRadius="lg" />
      <Box fontWeight={500}>
        <Text maxW={180} isTruncated>
          {fullName || receiver || t('...')}
        </Text>
        <SmallText color="blue.500">{hint}</SmallText>
      </Box>
    </Stack>
  )
}

export function ContactCard({
  contact,
  onEditContact,
  onRemoveContact,
  onRecoverContact,
  onKillContact,
}) {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const [{invites}, {deleteInvite, recoverInvite}] = useInvite()

  const invitee = invites.find(byId(contact))

  const {
    id,
    dbkey = id,
    key,
    receiver,
    address = receiver,
    firstName,
    lastName,
    canKill,
    mining,
    terminating,
    activated,
    identity: {state, stake} = {},
  } = {...contact, ...invitee}

  const {onCopy: onCopyKey} = useClipboard(key)

  const successToast = useSuccessToast()

  const isInviteExpired =
    state === IdentityStatus.Undefined && !canKill && !mining && !activated

  const status = isInviteExpired
    ? t('Expired invitation')
    : mining
    ? t('Mining...')
    : terminating
    ? t('Terminating...')
    : state === IdentityStatus.Invite
    ? t('Invitation')
    : mapToFriendlyStatus(state) ?? 'Unknown'

  const toDna = toLocaleDna(language)

  return (
    <>
      <Stack spacing={6} w="full">
        <Stack spacing={4}>
          <Stack isInline spacing={6} align="center" py={2}>
            <ContactAvatar address={address} h={80} w={80} borderRadius={20} />
            <Stack spacing="3/2" fontWeight={500}>
              <Stack isInline align="center">
                <Text fontSize="lg">
                  {`${firstName} ${lastName}`.trim() || t('...')}
                </Text>
                {mining && (
                  <ContactCardBadge bg="orange.010" color="orange.500">
                    {t('Mining...')}
                  </ContactCardBadge>
                )}
                {terminating && (
                  <ContactCardBadge bg="red.010" color="red.500">
                    {t('Terminating...')}
                  </ContactCardBadge>
                )}
              </Stack>
              <Text color="muted" fontSize="mdx" wordBreak="break-all">
                {address}
              </Text>
            </Stack>
          </Stack>

          <Stack isInline align="center" spacing={1} w="full">
            <IconButton2 icon="edit" onClick={onEditContact}>
              {t('Edit')}
            </IconButton2>
            <VDivider />
            <Tooltip label={t('Remove from device')}>
              <IconButton2
                icon="flip-editor-delete"
                onClick={() => {
                  deleteInvite(dbkey)
                  successToast({
                    title: t('Contact deleted'),
                    onAction: () => {
                      recoverInvite(dbkey)
                      onRecoverContact(contact)
                    },
                    actionContent: t('Undo'),
                  })
                  onRemoveContact()
                }}
              >
                {t('Delete contact')}
              </IconButton2>
            </Tooltip>
            {canKill && (
              <>
                <VDivider />
                <IconButton2
                  icon="delete"
                  variantColor="red"
                  _active={{
                    bg: 'red.012',
                  }}
                  _focus={{
                    boxShadow: '0 0 0 3px rgb(255 102 102 /0.50)',
                  }}
                  onClick={onKillContact}
                >
                  {t('Kill')}
                </IconButton2>
              </>
            )}
          </Stack>
        </Stack>

        <Stack spacing={5} bg="gray.50" px={10} py={8} borderRadius="md">
          <Stack spacing={0}>
            <ContactStat label={t('Status')} value={status} pt={2} pb={3} />

            {state !== IdentityStatus.Invite && !isInviteExpired && !mining && (
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
                      onClick={onCopyKey}
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

export function IssueInviteDrawer({onIssue, onIssueFail, ...props}) {
  const {t} = useTranslation()

  const {
    isOpen: isOpenAdvancedOptions,
    onToggle: onToggleAdvancedOptions,
  } = useDisclosure()

  const {addInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <ContactDrawerHeader address={dummyAddress}>
          {t('Invite new person')}
        </ContactDrawerHeader>
      </DrawerHeader>
      <DrawerBody>
        <Text color="brandGray.500" fontSize="md" mt={5} mb={6}>
          {t(
            `You can issue the invitation to the specific identity address in Advanced section`
          )}
        </Text>
        <Stack
          as="form"
          spacing={5}
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

              onIssue(invite)
            } catch (error) {
              setIsSubmitting(false)
              onIssueFail(error?.message)
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
export function EditContactDrawer({contact, onRename, ...props}) {
  const {t} = useTranslation()

  const {updateInvite} = useInviteDispatch()

  const [isSubmitting, setIsSubmitting] = React.useState()

  const {id, firstName, lastName, receiver} = contact

  const contactName = `${firstName} ${lastName}`.trim() || receiver

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <ContactDrawerHeader address={receiver} name={contactName} />
      </DrawerHeader>
      <Flex
        as="form"
        direction="column"
        flex={1}
        onSubmit={async e => {
          e.preventDefault()

          const {
            firstName: {value: firstNameValue},
            lastName: {value: lastNameValue},
          } = e.target.elements

          setIsSubmitting(true)
          await updateInvite(id, firstNameValue, lastNameValue)
          setIsSubmitting(false)

          onRename({firstName: firstNameValue, lastName: lastNameValue})
        }}
      >
        <DrawerBody>
          <Stack isInline spacing={4} mt={5}>
            <FormControl>
              <FormLabel>{t('First name')}</FormLabel>
              <Input id="firstName" defaultValue={firstName} />
            </FormControl>
            <FormControl>
              <FormLabel>{t('Last name')}</FormLabel>
              <Input id="lastName" defaultValue={lastName} />
            </FormControl>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <PrimaryButton type="submit" ml="auto" isLoading={isSubmitting}>
            {t('Save')}
          </PrimaryButton>
        </DrawerFooter>
      </Flex>
    </Drawer>
  )
}

export function KillInviteDrawer({invite, onKill, onKillFail, ...props}) {
  const {t, i18n} = useTranslation()

  const [isSubmitting, setIsSubmitting] = React.useState()

  const {address} = useIdentityState()

  const [{invites}, {killInvite}] = useInvite()

  const invitee = invites.find(byId(invite))

  const {id, firstName, lastName, receiver, state: status, stake} = {
    ...invite,
    state: invitee?.identity?.state,
  }

  const contactName = receiver || `${firstName} ${lastName}`.trim()

  return (
    <Drawer {...props}>
      <DrawerHeader>
        <ContactDrawerHeader address={receiver}>
          {t('Terminate invitation')}
        </ContactDrawerHeader>
      </DrawerHeader>
      <Flex
        as="form"
        direction="column"
        flex={1}
        onSubmit={async e => {
          e.preventDefault()

          setIsSubmitting(true)

          try {
            const {result, error} = await killInvite(id, address, receiver)

            setIsSubmitting(false)

            if (error) onKillFail(error?.message)
            else onKill(result)
          } catch (error) {
            setIsSubmitting(false)
            onKillFail(error?.message)
          }
        }}
      >
        <DrawerBody>
          <Text
            color="brandGray.500"
            fontSize="md"
            fontWeight={500}
            mt={5}
            mb={6}
          >
            {}
          </Text>
          <Stack bg="gray.50" px={6} py={3} borderRadius="lg" spacing={5}>
            <ContactStat label={t('Address')} value={contactName} />
            <ContactStat label={t('Status')} value={status} />
            <ContactStat
              label={t('Stake')}
              value={toLocaleDna(i18n.language)(stake ?? 0)}
            />
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <PrimaryButton type="submit" ml="auto" isLoading={isSubmitting}>
            {t('Create invitation')}
          </PrimaryButton>
        </DrawerFooter>
      </Flex>
    </Drawer>
  )
}
