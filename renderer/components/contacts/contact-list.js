import React from 'react'
import PropTypes from 'prop-types'
import {ContactCard} from './contact-card'
import {Box, Group, Text, Link} from '../../shared/components'

function ContactList({
  remainingInvites,
  sentInvites = [],
  contacts = [],
  onSelectInvite,
}) {
  return (
    <Box>
      <Group title={`Invites (${remainingInvites} left)`}>
        <Box m="1em 0">
          {sentInvites.length ? (
            sentInvites.map(({id, ...inviteProps}) => (
              <ContactCard
                key={id}
                id={id}
                {...inviteProps}
                onSelectInvite={onSelectInvite}
              />
            ))
          ) : (
            <Text>No invites sent yet...</Text>
          )}
        </Box>
      </Group>
      <Group title="Contacts">
        <Box m="1em 0">
          {contacts.map(({addr, ...contactProps}) => (
            <Link key={addr} href={`/contact-view?addr=${addr}`}>
              <ContactCard key={addr} id={addr} {...contactProps} />
            </Link>
          ))}
        </Box>
      </Group>
    </Box>
  )
}

const inviteType = PropTypes.shape({
  fullName: PropTypes.string,
  status: PropTypes.string,
})

ContactList.propTypes = {
  contacts: PropTypes.arrayOf(inviteType).isRequired,
  sentInvites: PropTypes.arrayOf(inviteType),
  remainingInvites: PropTypes.number,
  onSelectInvite: PropTypes.func,
}

export default ContactList
