/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {SubHeading, Text, Row, Col} from '../../shared/components'
import theme from '../../theme'
import Avatar from './user-avatar'

export const UserInfo = ({fullName, address}) => (
  <Row align="center">
    <Col w={3}>
      <Avatar name={fullName} />
    </Col>
    <Col w={9}>
      <SubHeading>{fullName}</SubHeading>
      <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
        {address}
      </Text>
    </Col>
  </Row>
)

UserInfo.propTypes = {
  fullName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
}
