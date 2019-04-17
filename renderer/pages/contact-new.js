import React from 'react'
import Router from 'next/router'
import {NewContactForm, ContactLayout} from '../components/contacts'
import {addContact} from '../api'

export default function() {
  return (
    <ContactLayout>
      <NewContactForm
        onSave={contact => {
          addContact(contact)
          Router.push('/contact-list')
        }}
      />
    </ContactLayout>
  )
}
