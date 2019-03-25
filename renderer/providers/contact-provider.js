import React, {createContext, useState, useEffect} from 'react'
import {fetchContactList} from '../services/api'

const ContactContext = createContext()

export const ContactProvider = ({children}) => {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    let ignore = false

    async function fetchContacts() {
      const contacts = await fetchContactList()
      if (!ignore) {
        setContacts(contacts)
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

export default ContactContext
