import React, {useContext, useEffect, useState} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import {ContactLayout, ContactDetails} from '../components/contacts'
import {ContactContext, NetContext} from '../providers'

function ContactView({router: {query}}) {
  const {addr} = query
  const {identities} = useContext(NetContext)
  const contacts = useContext(ContactContext)

  const [contact, setContact] = useState(null)

  useEffect(() => {
    if (!contacts || !identities || !addr) {
      return
    }
    const identity = identities.find(id => id.address === addr)
    setContact({
      ...contacts.find(c => c.addr === addr),
      status: identity && identity.state,
    })
  }, [addr, identities, contacts])

  return (
    <ContactLayout>
      <ContactDetails {...contact} />
    </ContactLayout>
  )
}

ContactView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
}

export default withRouter(ContactView)
