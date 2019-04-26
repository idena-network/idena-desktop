import React, {useContext, useState} from 'react'
import Link from 'next/link'
import {Layout} from '../components/layout'
import {
  UserInfo,
  UserActions,
  NetProfile,
  FlipGroup,
  ActivateInviteForm,
} from '../components/dashboard'
import FlipContext from '../providers/flip-provider'
import {AddFlipButton} from '../components/dashboard/add-flip-button'
import NetContext from '../providers/net-provider'
import {activateInvite, sendInvite} from '../api'
import {allowedToActivateInvite} from '../utils'
// eslint-disable-next-line import/no-named-as-default
import SendInviteForm from '../components/contacts/send-invite-form'
import {Heading, Row, Col, SubHeading, Drawer} from '../shared/components'

export default () => {
  const {drafts, published} = useContext(FlipContext)
  const netInfo = useContext(NetContext)

  const [activateResult, setActivateResult] = useState()
  const [inviteResult, setInviteResult] = useState()

  const [showSendInvite, toggleSendInvite] = useState(false)
  const [showActivateInvite, toggleActivateInvite] = useState(false)

  return (
    <Layout>
      <Row>
        <Col p="3em 2em" w={6}>
          <Heading>Profile</Heading>
          <UserActions
            onToggleSendInvite={() => toggleSendInvite(true)}
            canActivateInvite={allowedToActivateInvite(netInfo.state)}
            onToggleActivateInvite={() => toggleActivateInvite(true)}
          />
          <UserInfo fullName="Aleksandr Skakovskiy" address={netInfo.addr} />
          <NetProfile
            {...netInfo}
            canActivateInvite={allowedToActivateInvite(netInfo.state)}
            onToggleActivateInvite={() => toggleActivateInvite(true)}
          />
        </Col>
        <Col p="10em 1em" w={6}>
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
      <Drawer
        show={showActivateInvite}
        onHide={() => {
          toggleActivateInvite(false)
        }}
      >
        <ActivateInviteForm
          to={netInfo.addr}
          activateResult={activateResult}
          onActivateInviteSend={async (to, key) => {
            const result = await activateInvite(to, key)
            setActivateResult({result})
          }}
        />
      </Drawer>
      <Drawer
        show={showSendInvite}
        onHide={() => {
          toggleSendInvite(false)
        }}
      >
        <SendInviteForm
          inviteResult={inviteResult}
          onInviteSend={async (to, key) => {
            const result = await sendInvite(to, key)
            setInviteResult({result})
          }}
        />
      </Drawer>
    </Layout>
  )
}
