import React, {useContext, useState} from 'react'
import {FlipProvider} from '../flips/providers/flip-provider'
import NetContext from '../../shared/providers/net-provider'
import Layout from '../../components/layout'
import {Row, Col, Heading, Drawer} from '../../shared/components'
import {
  UserActions,
  UserInfo,
  NetProfile,
  ActivateInviteForm,
} from './components'
import {activateInvite, sendInvite} from '../../shared/api'
import {SendInviteForm} from '../contacts/components'

export default () => {
  const netInfo = useContext(NetContext)

  const [activateResult, setActivateResult] = useState()
  const [inviteResult, setInviteResult] = useState()

  const [showSendInvite, toggleSendInvite] = useState(false)
  const [showActivateInvite, toggleActivateInvite] = useState(false)

  return (
    <FlipProvider>
      <Layout>
        <Row>
          <Col p="3em 2em" w={6}>
            <Heading>Profile</Heading>
            <UserActions
              onToggleSendInvite={() => toggleSendInvite(true)}
              canActivateInvite
              onToggleActivateInvite={() => toggleActivateInvite(true)}
            />
            <UserInfo fullName="Me" address={netInfo.addr} />
            <NetProfile
              {...netInfo}
              canActivateInvite
              onToggleActivateInvite={() => toggleActivateInvite(true)}
            />
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
    </FlipProvider>
  )
}
