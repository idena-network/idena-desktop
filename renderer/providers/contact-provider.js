import React, {createContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {fetchContactList} from '../services/api'

const ContactContext = createContext()

export function ContactProvider({children}) {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchContacts() {
      const fetchedContacts = await fetchContactList()
      if (!ignore) {
        setContacts(fetchedContacts.map(x => ({...x, status: 'Verified'})))
      }
    }

    fetchContacts()

    return () => {
      ignore = true
    }
  }, [])
  return (
    <ContactContext.Provider value={contacts}>
      {children}
    </ContactContext.Provider>
  )
}

ContactProvider.propTypes = {
  children: PropTypes.node,
}

export default ContactContext
