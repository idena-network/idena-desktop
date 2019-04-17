const contactsKey = 'idena-contacts'

export function getContacts() {
  return JSON.parse(localStorage.getItem(contactsKey)) || []
}

export function addContact(contact) {
  const contacts = getContacts()
  localStorage.setItem(contactsKey, JSON.stringify(contacts.concat(contact)))
  return contact
}

export function updateContact(addr, nextContact) {
  const contacts = getContacts()
  const idx = contacts.findIndex(c => c.addr === addr)
  const nextContacts = [
    ...contacts.slice(0, idx),
    nextContact,
    ...contacts.slice(idx + 1),
  ]
  localStorage.setItem(contactsKey, JSON.stringify(nextContacts))
  return nextContacts
}
