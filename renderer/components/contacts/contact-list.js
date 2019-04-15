import React from 'react'
import PropTypes from 'prop-types'
import {ContactCard} from './contact-card'
import {Box, Group} from '../../shared/components'

function ContactList({remainingInvites, sentInvites = [], contacts = []}) {
  return (
    <Box>
      <Group title={`Invites (${remainingInvites} left)`}>
        <Box m="1em 0">
          {sentInvites.map(contact => (
            <ContactCard key={contact.fullName} {...contact} />
          ))}
        </Box>
      </Group>
      <Group title="Contacts">
        <Box m="1em 0">
          {contacts.map(contact => (
            <ContactCard key={contact.fullName} {...contact} />
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
}

export default ContactList
