import React from 'react'
import * as api from '../api'

const db = global.contactsDb || {}

const ContactStateContext = React.createContext()
const ContactDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function ContactProvider({children}) {
  const [contacts, setContacts] = React.useState([])

  React.useEffect(() => {
    // eslint-disable-next-line no-shadow
    const contacts = db.getContacts()
    setContacts(contacts)
  }, [])

  const addContact = contact => {
    api.addContact(contact)
    setContacts([...contacts, contact])
  }

  const removeContact = id => {
    setContacts(contacts.filter(c => c.id !== id))
  }

  return (
    <ContactStateContext.Provider value={{contacts}}>
      <ContactDispatchContext.Provider value={(addContact, removeContact)}>
        {children}
      </ContactDispatchContext.Provider>
    </ContactStateContext.Provider>
  )
}

function useContactState() {
  const context = React.useContext(ContactStateContext)
  if (context === undefined) {
    throw new Error('useContactState must be used within a ContactProvider')
  }
  return context
}

function useContactDispatch() {
  const context = React.useContext(ContactDispatchContext)
  if (context === undefined) {
    throw new Error('useContactDispatch must be used within a ContactProvider')
  }
  return context
}

export {ContactProvider, useContactState, useContactDispatch}
