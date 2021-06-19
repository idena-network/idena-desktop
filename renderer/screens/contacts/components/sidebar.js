/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Flex as ChakraFlex,
  Box,
  Text,
  Icon,
  Stack,
  IconButton,
} from '@chakra-ui/core'
import {useContactState} from '../../../shared/providers/contact-context'
import {useInviteState} from '../../../shared/providers/invite-context'
import useFullName from '../../../shared/hooks/use-full-name'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../../shared/providers/identity-context'
import {SmallText} from '../../oracles/components'
import {Input, Tooltip} from '../../../shared/components/components'
import {toPercent} from '../../../shared/utils/utils'
import {calculateInvitationRewardRatio} from '../../profile/utils'
import {useEpochState} from '../../../shared/providers/epoch-context'
import {useChainState} from '../../../shared/providers/chain-context'
import {ContactAvatar} from '../components'

export default function ContactListSidebar({
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
      <Box>
        <ContactListSearch
          onChange={e => {
            setTerm(e.target.value)
          }}
        />
        <InviteActionBar onNewInvite={onNewInvite} />
      </Box>
      <ContactList filter={term} onSelectInvite={onSelectInvite} />
    </Stack>
  )
}

function InviteActionBar({onNewInvite, ...props}) {
  const {t} = useTranslation()

  const {invites: availableInviteCount, canInvite} = useIdentityState()

  return (
    <ChakraFlex
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
    </ChakraFlex>
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
  ...props
}) {
  const fullName = useFullName(props)

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
