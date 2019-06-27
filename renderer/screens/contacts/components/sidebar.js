import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, border, margin, ellipsis, backgrounds} from 'polished'
import {Box, Group, Text, Input} from '../../../shared/components'
import {useContactState} from '../../../shared/providers/contact-context'
import theme from '../../../shared/theme'
import useFullName from '../shared/useFullName'
import Flex from '../../../shared/components/flex'
import Avatar from '../../flips/shared/components/avatar'
import {useInviteState} from '../../../shared/providers/invite-context'
import useUsername from '../../../shared/utils/use-username'
import {mapToFriendlyStatus} from '../../../shared/utils/useIdentity'

function Sidebar({onSelectContact, onSelectInvite}) {
  const {contacts} = useContactState()

  const [term, setTerm] = React.useState()

  React.useEffect(() => {
    if (contacts.length) {
      onSelectContact(contacts[0])
    }
  }, [contacts, onSelectContact])

  return (
    <Box
      style={{
        ...border('right', '1px', 'solid', theme.colors.gray2),
        width: rem(240),
        minHeight: '100vh',
      }}
    >
      <Search onInput={e => setTerm(e.target.value)} />
      <InviteSection>
        <InviteList onSelectInvite={onSelectInvite} />
      </InviteSection>
      <ContactSection>
        <ContactList filter={term} onSelectContact={onSelectContact} />
      </ContactSection>
    </Box>
  )
}

Sidebar.propTypes = {
  onSelectContact: PropTypes.func,
  onSelectInvite: PropTypes.func,
}

// eslint-disable-next-line react/prop-types
function InviteSection({children}) {
  return (
    <Group
      title="Invites"
      css={{...margin(rem(theme.spacings.medium16)), marginBottom: 0}}
    >
      {children}
    </Group>
  )
}

function InviteList({onSelectInvite}) {
  const {invites} = useInviteState()

  if (invites.length === 0) {
    return (
      <Text css={padding(rem(theme.spacings.medium16))}>No invites yet...</Text>
    )
  }

  return (
    <Box css={{...margin(0, 0, rem(theme.spacings.medium24), 0)}}>
      {invites.map(({id, ...invite}) => (
        <InviteCard
          key={id}
          {...invite}
          onClick={() => {
            if (onSelectInvite) {
              onSelectInvite(invite)
            }
          }}
        />
      ))}
    </Box>
  )
}

InviteList.propTypes = {
  onSelectInvite: PropTypes.func,
}

function InviteCard({receiver, mined, ...props}) {
  const fullName = useFullName(props)
  return (
    <Flex
      align="center"
      css={{cursor: 'pointer', ...padding(rem(theme.spacings.medium16))}}
      {...props}
    >
      <Avatar username={receiver} size={32} />
      <Box>
        <Box>
          <Text css={{...ellipsis(rem(140))}} title={fullName || receiver}>
            {fullName || receiver}
          </Text>
        </Box>
        <Box>
          <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
            {mined ? 'Mined' : 'Mining...'}
          </Text>
        </Box>
      </Box>
    </Flex>
  )
}

InviteCard.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  receiver: PropTypes.string,
  mined: PropTypes.bool,
}

// eslint-disable-next-line react/prop-types
function ContactSection({children}) {
  return (
    <Group
      title="Contacts"
      css={{...margin(rem(theme.spacings.medium16)), marginTop: 0}}
    >
      {children}
    </Group>
  )
}

function ContactList({filter, onSelectContact}) {
  const {contacts} = useContactState()

  const [currentIdx, setCurrentIdx] = React.useState(0)
  const [filteredContacts, setFilteredContacts] = React.useState([])

  React.useEffect(() => {
    if (filter && filter.length > 2) {
      // eslint-disable-next-line no-shadow
      const nextContacts = contacts.filter(({firstName, lastName, address}) =>
        [firstName, lastName, address].some(x =>
          x.toLowerCase().includes(filter.toLowerCase())
        )
      )
      setFilteredContacts(nextContacts)
    } else {
      setFilteredContacts(contacts)
    }
  }, [contacts, filter])

  if (filteredContacts.length === 0) {
    return (
      <Text css={padding(rem(theme.spacings.medium16))}>
        No contacts yet...
      </Text>
    )
  }

  return (
    <Box css={{...margin(0, 0, rem(theme.spacings.medium24), 0)}}>
      {filteredContacts.map((contact, idx) => (
        <ContactCard
          key={contact.id}
          {...contact}
          isCurrent={idx === currentIdx}
          onClick={() => {
            setCurrentIdx(idx)
            if (onSelectContact) {
              onSelectContact(contact)
            }
          }}
        />
      ))}
    </Box>
  )
}

ContactList.propTypes = {
  filter: PropTypes.string,
  onSelectContact: PropTypes.func,
}

function ContactCard({
  address,
  firstName,
  lastName,
  state,
  isCurrent,
  ...props
}) {
  const fullName = useFullName({firstName, lastName})
  const username = useUsername({address, fullName})
  return (
    <Flex
      align="center"
      css={{
        ...backgrounds(isCurrent ? theme.colors.gray2 : ''),
        cursor: 'pointer',
        ...padding(rem(theme.spacings.medium16)),
      }}
      {...props}
    >
      <Avatar username={username} size={32} />
      <Box>
        <Box>
          <Text css={{wordBreak: 'break-all'}}>{fullName || address}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
            {mapToFriendlyStatus(state)}
          </Text>
        </Box>
      </Box>
    </Flex>
  )
}

ContactCard.propTypes = {
  id: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  state: PropTypes.string.isRequired,
  isCurrent: PropTypes.bool,
}

function Search(props) {
  return (
    <Box p={rem(theme.spacings.medium16)}>
      <Input
        type="search"
        placeholder="Search"
        style={{...backgrounds(theme.colors.gray), border: 'none'}}
        {...props}
      />
    </Box>
  )
}

export default Sidebar
