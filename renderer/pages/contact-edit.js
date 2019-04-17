import React, {useContext} from 'react'
import PropTypes from 'prop-types'
import Router, {withRouter} from 'next/router'
import {ContactLayout, EditContactForm} from '../components/contacts'
import {ContactContext} from '../providers'
import {updateContact} from '../api'

function ContactEdit({router: {query}}) {
  if (query) {
    const {addr} = query
    const contacts = useContext(ContactContext)
    const contact = contacts.find(c => c.addr === addr)
    return (
      <ContactLayout>
        <EditContactForm
          {...contact}
          onSave={editContact => {
            updateContact(addr, editContact)
            Router.push(`/contact-view?addr=${addr}`)
          }}
        />
      </ContactLayout>
    )
  }
  return null
}

ContactEdit.propTypes = {
  router: PropTypes.objectOf({
    query: PropTypes.objectOf({addr: PropTypes.string}),
  }),
}

export default withRouter(ContactEdit)
