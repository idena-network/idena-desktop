import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../shared/theme'
import Avatar from './contact-avatar'
import {Box, Row, Col, Text} from '../../../shared/components'

export const ContactCard = ({
  id,
  name,
  lastName,
  fullName = `${name} ${lastName}`,
  status = 'Undefined',
  onSelectInvite,
  // onSelectContact,
}) => {
  return (
    <Row
      align="center"
      onClick={() => {
        if (onSelectInvite) {
          onSelectInvite(id)
        }
      }}
      css={{cursor: 'pointer', marginBottom: '1em'}}
    >
      <Col w={3}>
        <Avatar name={fullName || `${name} ${lastName}`} />
      </Col>
      <Col w={9}>
        <Box>
          <Text css={{wordBreak: 'break-all'}}>{fullName}</Text>
        </Box>
        <Box>
          <Text color={theme.colors.muted} fontSize={theme.fontSizes.small}>
            {status}
          </Text>
        </Box>
      </Col>
    </Row>
  )
}

ContactCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  lastName: PropTypes.string,
  fullName: PropTypes.string,
  status: PropTypes.string.isRequired,
  onSelectInvite: PropTypes.func,
  // onSelectContact: PropTypes.func,
}

export default ContactCard
