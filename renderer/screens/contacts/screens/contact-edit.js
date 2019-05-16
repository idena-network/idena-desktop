import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import Router, {withRouter} from 'next/router'
import {EditContactForm} from '../components'
import ContactContext, {ContactProvider} from '../providers/contact-provider'
import Layout from '../shared/contact-layout'
import {updateContact} from '../../../shared/api'

function ContactEdit({router: {query}}) {
  if (query) {
    const {addr} = query
    const contacts = useContext(ContactContext) || []
    const contact = contacts.find(c => c.addr === addr)
    return (
      <ContactProvider>
        <Layout>
          <EditContactForm
            {...contact}
            onSave={editContact => {
              updateContact(addr, editContact)
              Router.push(`/contacts/screens/contact-view?addr=${addr}`)
            }}
          />
        </Layout>
      </ContactProvider>
    )
  }
  return null
}

ContactEdit.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
}

export default withRouter(ContactEdit)
