import React from 'react'
import Router from 'next/router'
import Layout from '../../screens/contacts/shared/contact-layout'
import {NewContactForm} from '../../screens/contacts/components'
import {addContact} from '../../shared/api'

export default function() {
  return (
    <Layout>
      <NewContactForm
        onSave={contact => {
          addContact(contact)
          Router.push('/contacts')
        }}
      />
    </Layout>
  )
}
