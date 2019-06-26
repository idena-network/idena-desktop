import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, border, margin} from 'polished'
import {Box, Group, Text} from '../../../shared/components'
import {useContactState} from '../../../shared/providers/contact-context'
import theme from '../../../shared/theme'
import useFullName from '../shared/useFullName'
import Flex from '../../../shared/components/flex'
import Avatar from '../../flips/shared/components/avatar'
import {useInviteState} from '../../../shared/providers/invite-context'
import useUsername from '../../../shared/utils/use-username'

function Sidebar({onSelectContact, onSelectInvite}) {
  const {contacts} = useContactState()

  React.useEffect(() => {
    if (contacts.length) {
      onSelectContact(contacts[0])
    }
  }, [contacts, onSelectContact])

  return (
    <Box
      style={{
        ...border('right', '1px', 'solid', theme.colors.gray2),
        ...padding(rem(theme.spacings.medium16)),
        width: rem(240),
      }}
    >
      <InviteSection>
        <InviteList onSelectInvite={onSelectInvite} />
      </InviteSection>
      <ContactSection>
        <ContactList onSelectContact={onSelectContact} />
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
  const remainingInvites = [1]
  return (
    <Group title={`Invites (${remainingInvites.length} left)`}>
      {children}
    </Group>
  )
}

function InviteList({onSelectInvite}) {
  const {invites} = useInviteState()

  if (invites.length === 0) {
    return <Text>No invites yet...</Text>
  }

  return (
    <Box my={rem(theme.spacings.medium32)}>
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

function InviteCard({receiver, status, ...props}) {
  const fullName = useFullName(props)
  return (
    <Flex
      align="center"
      style={{cursor: 'pointer', ...margin(0, 0, rem(theme.spacings.medium16))}}
      {...props}
    >
      <Avatar username={receiver} size={32} />
      <Box>
        <Box>
          <Text css={{wordBreak: 'break-all'}}>{fullName || receiver}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
            {status}
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
  status: PropTypes.string.isRequired,
}

// eslint-disable-next-line react/prop-types
function ContactSection({children}) {
  return (
    <Group title="Contacts">
      <Box m="1em 0">{children}</Box>
    </Group>
  )
}

function ContactList({onSelectContact}) {
  const {contacts} = useContactState()
  return (
    <Box my={rem(theme.spacings.medium24)}>
      {contacts.map(contact => (
        <ContactCard
          key={contact.id}
          {...contact}
          onClick={() => {
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
  onSelectContact: PropTypes.func,
}

function ContactCard({
  address,
  firstName,
  lastName,
  status = 'Status...',
  ...props
}) {
  const fullName = useFullName({firstName, lastName})
  const username = useUsername({address, fullName})
  return (
    <Flex
      align="center"
      css={{cursor: 'pointer', ...margin(0, 0, rem(theme.spacings.medium16))}}
      {...props}
    >
      <Avatar username={username} size={32} />
      <Box>
        <Box>
          <Text css={{wordBreak: 'break-all'}}>{fullName || address}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
            {status}
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
  status: PropTypes.string.isRequired,
}

export default Sidebar
