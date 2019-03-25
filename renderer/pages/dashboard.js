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
  const {drafts, published} = useContext(FlipContext)
  const netInfo = useContext(NetContext)
  return (
    <Layout>
      <Row>
        <Col w={6} p={'3em 2em'}>
          <Heading>My Idena</Heading>
          <UserInfo user={{name: 'mmmkey', address: netInfo.addr}} />
          <UserActions />
          <NetProfile {...netInfo} />
        </Col>
        <Col w={6} p="10em 1em">
          <SubHeading>
            <Row>
              <Col w={11}>My FLIPs</Col>
              <Col w={1}>
                <Link href="/submit-flip">
                  <AddFlipButton />
                </Link>
              </Col>
            </Row>
          </SubHeading>
          <FlipGroup name="Drafts" flips={drafts} />
          <FlipGroup name="Published" flips={published} />
        </Col>
      </Row>
    </Layout>
  )
}
