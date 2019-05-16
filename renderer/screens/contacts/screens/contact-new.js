import React from 'react'
import Router from 'next/router'
import Layout from '../shared/contact-layout'
import {NewContactForm} from '../components'
import {addContact} from '../../../shared/api'

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
