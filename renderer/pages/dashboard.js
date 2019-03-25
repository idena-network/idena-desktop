import React, {useContext} from 'react'
import {Layout} from '../components/layout'
import {Heading, Row, Col, SubHeading} from '../components/atoms'
import {
  UserInfo,
  UserActions,
  NetProfile,
  FlipGroup,
} from '../components/dashboard'
import FlipContext from '../providers/flip-provider'
import {AddFlipButton} from '../components/dashboard/add-flip-button'
import Link from 'next/link'
import NetContext from '../providers/net-provider'

export default () => {
  const flips = useContext(FlipContext)
  const netInfo = useContext(NetContext)
  return (
    <Layout>
      <Heading>My Idena</Heading>
      <Row>
        <Col w={4}>
          <UserInfo user={{name: 'mmmkey', address: netInfo.addr}} />
          <UserActions />
          <NetProfile {...netInfo} />
        </Col>
        <Col p="2em 1em" w={8}>
          <SubHeading>
            <Row>
              <Col w={10}>My FLIPs</Col>
              <Col w={2}>
                <Link href="/flip">
                  <AddFlipButton />
                </Link>
              </Col>
            </Row>
          </SubHeading>
          <FlipGroup name="Drafts" flips={flips} />
          <FlipGroup name="Published" flips={flips} />
        </Col>
      </Row>
    </Layout>
  )
}
