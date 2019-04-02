import React, {useContext, useState, useEffect} from 'react'
import Link from 'next/link'
import {Layout} from '../components/layout'
import {Heading, Row, Col, SubHeading, Box, Drawer} from '../components/atoms'
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
import {Button} from '../components/atoms/button'
import {abToStr} from '../utils/string'
import {activateInvite, sendInvite} from '../api'
import {allowedToActivateInvite} from '../utils'
// eslint-disable-next-line import/no-named-as-default
import SendInviteForm from '../components/contacts/send-invite-form'

const Convert = require('ansi-to-html')

const convert = new Convert()
const createLogMarkup = log => ({__html: log})

export default () => {
  const {drafts, published} = useContext(FlipContext)
  const netInfo = useContext(NetContext)
  const [nodeState, setNodeState] = useState({
    log: '',
    status: 'offline',
  })
  useEffect(() => {
    global.ipcRenderer.on('node-log', (_, message) => {
      setNodeState(prevState => ({
        ...prevState,
        status: 'on',
        log: abToStr(message.log).concat(prevState.log),
      }))
    })
    return () => {
      global.ipcRenderer.removeAllListeners('node-log')
    }
  }, [])
  const [showActivateInviteForm, setActivateInviteFormVisibility] = useState(
    false
  )
  const [activateResult, setActivateResult] = useState()
  const [showSendInviteForm, setSendInviteFormVisibility] = useState(false)
  const [inviteResult, setInviteResult] = useState()
  return (
    <Layout>
      <Row>
        <Col p="3em 2em" w={6}>
          <Heading>
            My Idena &nbsp;
            <Button
              size={0.7}
              onClick={() => {
                global.ipcRenderer.send('node-start', true)
              }}
            >
              <span role="img" aria-label="Start node">
                ▶️
              </span>
            </Button>
          </Heading>
          <UserInfo user={{name: 'optimusway', address: netInfo.addr}} />
          <UserActions
            onSendInviteShow={() => setSendInviteFormVisibility(true)}
            allowedToActivateInvite={allowedToActivateInvite(netInfo.state)}
            onActivateInviteShow={() => setActivateInviteFormVisibility(true)}
          />
          <NetProfile
            {...netInfo}
            allowedToActivateInvite={allowedToActivateInvite(netInfo.state)}
            onActivateInviteShow={() => setActivateInviteFormVisibility(true)}
          />
          <Box>
            <pre
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={createLogMarkup(
                convert.toHtml(nodeState.log) || 'waiting for logs...'
              )}
            />
            <style jsx>{`
              pre {
                height: 200px;
                max-height: 200px;
                max-width: 350px;
                overflow: auto;
                word-break: break-all;
                white-space: pre-line;
              }
            `}</style>
          </Box>
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
        show={showActivateInviteForm}
        onHide={() => {
          setActivateInviteFormVisibility(false)
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
        show={showSendInviteForm}
        onHide={() => {
          setSendInviteFormVisibility(false)
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
