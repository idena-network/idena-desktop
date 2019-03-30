import React from 'react'
import PropTypes from 'prop-types'
// eslint-disable-next-line import/no-named-as-default
import ContactCard from './contact-card'

export const ContactList = ({contacts}) => (
  <div>
    {contacts.map(contact => (
      <ContactCard key={contact.fullName} {...contact} />
    ))}
  </div>
)

ContactList.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({fullName: PropTypes.string, status: PropTypes.string})
  ).isRequired,
}

export default ContactList
