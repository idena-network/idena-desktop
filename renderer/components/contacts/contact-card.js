import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Text} from '../atoms'
import theme from '../../theme'
import Avatar from './contact-avatar'
import {Box} from '../atoms/box'

export const ContactCard = ({fullName, status}) => (
  <Row align="center">
    <Col w={3}>
      <Avatar name={fullName} />
    </Col>
    <Col w={9}>
      <Box>
        <Text>{fullName}</Text>
      </Box>
      <Box>
        <Text color={theme.colors.primary} small>
          {status}
        </Text>
      </Box>
    </Col>
  </Row>
)

ContactCard.propTypes = {
  fullName: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
}

export default ContactCard
