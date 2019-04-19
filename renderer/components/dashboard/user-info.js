/* eslint-disable import/prefer-default-export */
import React from 'react'
import PropTypes from 'prop-types'
import {SubHeading, Text, Row, Col, Box} from '../../shared/components'
import theme from '../../theme'
// import Avatar from './user-avatar'

export function UserInfo({fullName, address}) {
  return (
    <Row align="center">
      {/* <Col w={0}>
        <Avatar name={fullName} />
      </Col> */}
      <Col w={100}>
        <SubHeading>{fullName}</SubHeading>
        <Box>
          <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
            {address}
          </Text>
        </Box>
      </Col>
    </Row>
  )
}

UserInfo.propTypes = {
  fullName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
}
