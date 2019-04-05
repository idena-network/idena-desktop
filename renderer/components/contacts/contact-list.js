import React, {useContext} from 'react'
import PropTypes from 'prop-types'
// eslint-disable-next-line import/no-named-as-default
import ContactCard from './contact-card'
import {NetContext} from '../../providers'
import {Text, Box} from '../atoms'
import theme from '../../theme'

export const ContactList = ({contacts}) => {
  const {invites} = useContext(NetContext)
  return (
    <Box>
      <Text color={theme.colors.muted}>Invites ({invites} left)</Text>
      <Box m="1em 0">
        {contacts.map(contact => (
          <ContactCard key={contact.fullName} {...contact} />
        ))}
      </Box>
    </Box>
  )
}

ContactList.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({fullName: PropTypes.string, status: PropTypes.string})
  ).isRequired,
}

export default ContactList
