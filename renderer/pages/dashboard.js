import React, {useContext} from 'react'
import {Layout} from '../components/layout'
import {Heading, Row, Col, SubHeading} from '../components/atoms'
import createStore from '../store'
import {
  UserInfo,
  UserActions,
  NetProfile,
  FlipGroup,
} from '../components/dashboard'
import FlipContext from '../providers/flip-provider'

const {user} = createStore()

export default () => {
  const flips = useContext(FlipContext)
  return (
    <Layout>
      <Heading>My Idena</Heading>
      <Row>
        <Col>
          <UserInfo user={user} />
          <UserActions />
          <NetProfile />
        </Col>
        <Col p="2em 1em">
          <SubHeading>My FLIPs</SubHeading>
          <FlipGroup name="Drafts" flips={flips} />
          <FlipGroup name="Published" flips={flips} />
        </Col>
      </Row>
    </Layout>
  )
}
