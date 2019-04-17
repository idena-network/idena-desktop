import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'
import Avatar from './contact-avatar'
import {Box, Row, Col, Text} from '../../shared/components'

export const ContactCard = ({id, fullName, status, onSelectInvite}) => (
  <Row
    align="center"
    onClick={() => onSelectInvite(id)}
    css={{cursor: 'pointer', marginBottom: '1em'}}
  >
    <Col w={3}>
      <Avatar name={fullName} />
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

ContactCard.propTypes = {
  id: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  onSelectInvite: PropTypes.func,
}

export default ContactCard
