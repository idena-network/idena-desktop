import React from 'react'
import PropTypes from 'prop-types'
import {rem, padding, border, margin, ellipsis, backgrounds} from 'polished'
import {Box, Group, Text, Input, Button} from '../../../shared/components'
import {useContactState} from '../../../shared/providers/contact-context'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Avatar from '../../../shared/components/avatar'
import {Actions} from './actions'
import {useInviteState} from '../../../shared/providers/invite-context'
import useUsername from '../../../shared/hooks/use-username'
import useFullName from '../../../shared/hooks/use-full-name'
import {mapToFriendlyStatus} from '../../../shared/providers/identity-context'

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
        width: rem(270),
        height: '91vh',
        overflowY: 'auto',
      }}
    >
      <Search onChange={e => setTerm(e.target.value)} />
      <Actions />
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
  return <SidebarHeading title="Invites">{children}</SidebarHeading>
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
          id={invite.dbkey}
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

function InviteCard({id, receiver, mined, mining, activated, canKill, ...props}) {
  const fullName = useFullName(props)
  return (
    <div className="card">
      <Flex align="center" {...props}>
        <Avatar username={receiver} size={32} />
        <Box>
          <Box>
            <div
              className="card__title"
              style={{...ellipsis(rem(140))}}
              title={fullName || receiver}
            >
              {fullName || receiver}
            </div>
          </Box>
          <Box>
            <div className="card__hint">
              {(activated && canKill) ? 'Accepted' :
                (mining ? 'Mining...' :
                    ''
                )
              }
            </div>
          </Box>
        </Box>
      </Flex>
      <style jsx>{`
        .card {
          cursor: pointer;
          padding: ${rem(6)} ${rem(theme.spacings.medium16)};
        }
        .card__title {
          color: ${theme.colors.text};
          font-size: ${rem(15)};
          line-height: ${rem(15)};
          font-weight: ${theme.fontWeights.medium};
          display: block;
        }
        .card__hint {
          color: ${theme.colors.muted};
          font-size: ${rem(13)};
          line-height: ${rem(10)};
          font-weight: ${theme.fontWeights.medium};
        }
      `}</style>
    </div>
  )
}

InviteCard.propTypes = {
  id: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  receiver: PropTypes.string,
  mined: PropTypes.bool,
  mining: PropTypes.bool,
  activated: PropTypes.bool,
  canKill: PropTypes.bool,
}

// eslint-disable-next-line react/prop-types
function ContactSection({children}) {
  return <SidebarHeading title="Contacts">{children}</SidebarHeading>
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
    <div
      className="card"
      style={{
        ...backgrounds(isCurrent ? theme.colors.gray : ''),
      }}
    >
      <Flex align="center" {...props}>
        <Avatar username={username} size={32} />
        <Box>
          <Box>
            <div
              className="card__title"
              style={{...ellipsis(rem(140))}}
              title={fullName || address}
            >
              {fullName || address}
            </div>
          </Box>
          <Box>
            <div className="card__hint">{mapToFriendlyStatus(state)}</div>
          </Box>
        </Box>
      </Flex>
      <style jsx>{`
        .card {
          cursor: pointer;
          padding: ${rem(6)} ${rem(theme.spacings.medium16)};
        }
        .card__title {
          color: ${theme.colors.text};
          font-size: ${rem(15)};
          line-height: ${rem(15)};
          font-weight: ${theme.fontWeights.medium};
          display: block;
        }
        .card__hint {
          color: ${theme.colors.primary};
          font-size: ${rem(13)};
          line-height: ${rem(10)};
          font-weight: ${theme.fontWeights.medium};
        }
      `}</style>
    </div>
  )
}

ContactCard.propTypes = {
  id: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  state: PropTypes.string,
  isCurrent: PropTypes.bool,
}

function Search(props) {
  return (
    <Box p={rem(theme.spacings.medium16)}>
      <Input
        type="search"
        placeholder="Search"
        style={{
          ...backgrounds(theme.colors.gray),
          border: 'none',
          textAlign: 'center',
          width: '100%',
          outline: 'none',
        }}
        {...props}
      />
    </Box>
  )
}

function SidebarHeading({children, title}) {
  return (
    <Group
      title={title}
      addon={
        <Button
          type="button"
          style={{
            borderRadius: '3px',
            width: rem(20),
            height: rem(20),
            fontSize: rem(21),
            lineHeight: rem(5),
            padding: '0 2px 2px',
            fontWeight: 'bold',
            display: 'block',
            top: '50%',
            position: 'absolute',
            right: rem(18),
            transform: 'translate(0, -50%)',
          }}
        >
          +
        </Button>
      }
      css={{
        position: 'relative',
        paddingTop: rem(7),
        paddingLeft: rem(theme.spacings.medium16),
        paddingBottom: rem(7),
        paddingRight: rem(28),
        width: '100%',
      }}
    >
      {children}
    </Group>
  )
}

SidebarHeading.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
}

export default Sidebar
