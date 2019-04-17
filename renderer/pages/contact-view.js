import React, {useContext} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import {ContactLayout, ContactDetails} from '../components/contacts'
import {ContactContext} from '../providers'

function ContactView({router: {query}}) {
  if (query) {
    const contacts = useContext(ContactContext)
    const {addr} = query
    const contact = contacts.find(c => c.addr === addr)
    return contact ? (
      <ContactLayout>
        <ContactDetails {...contact} />
      </ContactLayout>
    ) : null
  }
  return null
}

ContactView.propTypes = {
  router: PropTypes.objectOf({
    query: PropTypes.objectOf({addr: PropTypes.string}),
  }),
}

export default withRouter(ContactView)
