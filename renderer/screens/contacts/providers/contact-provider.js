import React, {createContext, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {getContacts} from '../../../shared/api'

const ContactContext = createContext()

export function ContactProvider({children}) {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchContacts() {
      const savedContacts = await getContacts()
      if (!ignore) {
        setContacts(savedContacts)
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
