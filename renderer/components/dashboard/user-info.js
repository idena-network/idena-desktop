/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {SubHeading, Text, Row, Col} from '../atoms'
import theme from '../../theme'
import Avatar from './user-avatar'

export const UserInfo = ({user}) => (
  <Row align="center">
    <Col w={3}>
      <Avatar name={user.name} />
    </Col>
    <Col w={9}>
      <SubHeading>{user.name}</SubHeading>
      <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
        {user.address}
      </Text>
    </Col>
  </Row>
)

UserInfo.propTypes = {
  user: PropTypes.shape({name: PropTypes.string, address: PropTypes.string}),
}
