/* eslint-disable no-nested-ternary */
import React from 'react'
import PropTypes from 'prop-types'
import {padding, border, margin, ellipsis, backgrounds} from 'polished'
import {useTranslation} from 'react-i18next'
import {useColorMode} from '@chakra-ui/core'
import {Box, Text, Input, Button} from '../../../shared/components'
import {useContactState} from '../../../shared/providers/contact-context'
import theme, {rem} from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Avatar from '../../../shared/components/avatar'
import {useInviteState} from '../../../shared/providers/invite-context'
import useUsername from '../../../shared/hooks/use-username'
import useFullName from '../../../shared/hooks/use-full-name'
import {
  mapToFriendlyStatus,
  useIdentityState,
} from '../../../shared/providers/identity-context'

function Sidebar({onSelectContact, onSelectInvite, onNewInvite}) {
  const {contacts} = useContactState()

  const [term, setTerm] = React.useState()

  const {colorMode} = useColorMode()

  React.useEffect(() => {
    if (contacts.length) {
      onSelectContact(contacts[0])
    }
  }, [contacts, onSelectContact])

  return (
    <Box
      style={{
        ...border('right', '1px', 'solid', theme.colors[colorMode].gray2),
        width: rem(270),
        minWidth: rem(270),
        height: '91vh',
        overflowY: 'auto',
      }}
    >
      <Search onChange={e => setTerm(e.target.value)} />
      <InviteSection onNewInvite={onNewInvite}>
        <InviteList filter={term} onSelectInvite={onSelectInvite} />
      </InviteSection>
    </Box>
  )
}

Sidebar.propTypes = {
  onSelectContact: PropTypes.func,
  onSelectInvite: PropTypes.func,
  onNewInvite: PropTypes.func,
}

// eslint-disable-next-line react/prop-types
function InviteSection({onNewInvite, children}) {
  const {t} = useTranslation()
  const {invites: invitesCount} = useIdentityState()
  return (
    <SidebarHeading
      onNewInvite={invitesCount ? onNewInvite : null}
      title={t(`Invites (${invitesCount} left)`)}
    >
      {children}
    </SidebarHeading>
  )
}

function InviteList({filter, onSelectInvite}) {
  const {t} = useTranslation()

  const {invites} = useInviteState()

  const [filteredInvites, setFilteredInvites] = React.useState([])

  React.useEffect(() => {
    if (filter && filter.length > 0) {
      // eslint-disable-next-line no-shadow
      const nextInvite = invites.filter(({firstName, lastName, receiver}) =>
        [firstName, lastName, receiver].some(x =>
          x.toLowerCase().includes(filter.toLowerCase())
        )
      )
      setFilteredInvites(nextInvite)
    } else {
      setFilteredInvites(invites)
    }
  }, [invites, filter])

  if (filter && filteredInvites.length === 0) {
    return (
      <Text css={padding(rem(theme.spacings.medium16))}>
        {t('No invites found...')}
      </Text>
    )
  }

  return (
    <Box css={{...margin(0, 0, rem(theme.spacings.medium24), 0)}}>
      {filteredInvites
        .filter(invite => !invite.deletedAt)
        .map(invite => (
          <InviteCard
            id={invite.dbkey}
            {...invite}
            state={invite.identity && invite.identity.state}
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
  filter: PropTypes.string,
  onSelectInvite: PropTypes.func,
}

function InviteCard({
  receiver,
  mining,
  terminating,
  activated,
  state,
  ...props
}) {
  const fullName = useFullName(props)

  const {t} = useTranslation()

  const hint = mining
    ? t('Mining...')
    : terminating
    ? t('Terminating...')
    : activated
    ? mapToFriendlyStatus(state)
    : ''

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
            <div className="card__hint">{hint}</div>
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
          font-weight: ${theme.fontWeights.medium};
          display: block;
        }
        .card__hint {
          color: ${theme.colors.muted};
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
  terminating: PropTypes.bool,
  activated: PropTypes.bool,
  canKill: PropTypes.bool,
  state: PropTypes.string,
}

function ContactList({filter, onSelectContact}) {
  const {t} = useTranslation()
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
        {t('No contacts found...')}
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
  const {t} = useTranslation()
  const {colorMode} = useColorMode()
  return (
    <Box p={rem(theme.spacings.medium16)}>
      <Input
        type="search"
        placeholder={t('Search')}
        style={{
          ...backgrounds(theme.colors[colorMode].gray),
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

function SidebarHeading({children, title, onNewInvite}) {
  return (
    <Box>
      <Text
        color={theme.colors.muted}
        css={{
          position: 'relative',
          paddingTop: rem(7),
          paddingLeft: rem(theme.spacings.medium16),
          paddingBottom: rem(7),
          paddingRight: rem(28),
          width: '100%',
        }}
      >
        {title}
        <Button
          disabled={onNewInvite === null}
          onClick={onNewInvite}
          type="button"
          style={{
            width: rem(24),
            height: rem(24),
            fontSize: rem(18),
            lineHeight: rem(5),
            padding: '0',
            color: theme.colors.primary,
            background: 'transparent',
            display: 'block',
            top: '50%',
            position: 'absolute',
            right: rem(18),
            transform: 'translate(0, -50%)',
          }}
        >
          <i className="icon icon--add_btn" />
        </Button>
      </Text>
      <Box>{children}</Box>
    </Box>
  )
}

SidebarHeading.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  onNewInvite: PropTypes.func,
}

export default Sidebar
