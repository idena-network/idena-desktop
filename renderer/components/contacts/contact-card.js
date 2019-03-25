import React from 'react'
import {Row, Col, Text} from '../atoms'
import theme from '../../theme'

export default ({fullName, status}) => (
  <Row align="center">
    <Col w={3}>
      <div>🤖</div>
    </Col>
    <Col w={9}>
      <Text>{fullName}</Text>
      <br />
      <Text color={theme.colors.primary} small>
        {status}
      </Text>
    </Col>
    <style jsx>{`
      div {
        background: ${theme.colors.gray};
        border-radius: 8px;
        padding: 0.5em;
        margin: 0.5em;
        margin-right: 1em;
        margin-left: 0;
        text-align: center;
      }
    `}</style>
  </Row>
)
