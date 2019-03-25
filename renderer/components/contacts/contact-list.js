import React from 'react'
import ContactCard from './contact-card'

export default ({contacts}) => (
  <div>
    {contacts.map(contact => (
      <ContactCard {...contact} />
    ))}
  </div>
)
