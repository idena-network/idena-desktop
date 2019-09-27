import React from 'react'
import {margin, rem} from 'polished'
import QRCode from 'qrcode.react'

import Layout from '../../shared/components/layout'
import {
  Box,
  Heading,
  SubHeading,
  Input,
  Label,
  Button,
  Modal,
  Text,
  Field,
} from '../../shared/components'
import theme from '../../shared/theme'
import {FlatButton} from '../../shared/components/button'
import Divider from '../../shared/components/divider'
import Flex from '../../shared/components/flex'
import useFlips from '../../shared/utils/useFlips'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {usePersistence} from '../../shared/hooks/use-persistent-state'
import {BASE_API_URL} from '../../shared/api/api-client'
import {loadState} from '../../shared/utils/persist'
import useRpc from '../../shared/hooks/use-rpc'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()

  const [state, dispatch] = usePersistence(
    React.useReducer(
      // eslint-disable-next-line no-shadow
      (state, [type, url]) => {
        switch (type) {
          case 'url/reset':
            return {...state, isSaved: false}
          case 'url/change':
            return {...state, url, isSaved: false}
          case 'url/save':
            return {...state, isSaved: true}
          default:
            return state
        }
      },
      loadState('settings') || {
        url: BASE_API_URL,
        isSaved: false,
      }
    ),
    'settings',
    ['url/save', 'url/reset']
  )

  React.useEffect(() => {
    if (state.isSaved) {
      addNotification({
        title: 'Settings updated',
        body: `Connected to ${state.url}`,
      })
      dispatch(['url/reset'])
    }
  }, [addNotification, dispatch, state.isSaved, state.url])

  return (
    <Layout>
      <Box padding={theme.spacings.normal}>
        <Heading>Settings</Heading>
        <Box>
          <SubHeading>Node settings</SubHeading>
          <Label htmlFor="url">Address</Label>
          <Flex align="center">
            <Input
              value={state.url}
              onChange={e => dispatch(['url/change', e.target.value])}
              style={{
                ...margin(0, theme.spacings.normal, 0, 0),
                width: rem(300),
              }}
            />
            <Button onClick={() => dispatch(['url/save'])}>Save</Button>
            <Divider vertical m={theme.spacings.small} />
            <FlatButton
              color={theme.colors.primary}
              onClick={() => dispatch(['url/change', BASE_API_URL])}
            >
              Use default
            </FlatButton>
          </Flex>
        </Box>
        {global.isDev && (
          <>
            <Section title="Flips">
              <Box>
                <Button
                  onClick={() => {
                    clearFlips()
                    addNotification({title: 'Flips deleted'})
                  }}
                >
                  Clear flips
                </Button>
              </Box>
              <Box my={theme.spacings.small}>
                <Button
                  onClick={() => {
                    archiveFlips()
                    addNotification({title: 'Flips archived'})
                  }}
                >
                  Archive flips
                </Button>
              </Box>
            </Section>
            <Section title="Invites">
              <Box my={theme.spacings.small}>
                <Button
                  onClick={() => {
                    inviteDb.clearInvites()
                    addNotification({title: 'Invites removed'})
                  }}
                >
                  Clear invites
                </Button>
              </Box>
            </Section>
            <ExportPK />
          </>
        )}
      </Box>
    </Layout>
  )
}

// eslint-disable-next-line react/prop-types
function Section({title, children}) {
  return (
    <Box my={rem(theme.spacings.medium32)}>
      <SubHeading css={margin(0, 0, theme.spacings.small, 0)}>
        {title}
      </SubHeading>
      <Box my={rem(theme.spacings.small8)}>{children}</Box>
    </Box>
  )
}

function ExportPK() {
  const [{result: pk}, callRpc] = useRpc()
  const [password, setPassword] = React.useState()
  const [showDialog, setShowDialog] = React.useState()
  return (
    <Section title="Export PK">
      <Label htmlFor="url">Password</Label>
      <Flex align="center">
        <Input
          value={password}
          type="password"
          style={{
            ...margin(0, theme.spacings.normal, 0, 0),
            width: rem(300),
          }}
          onChange={e => setPassword(e.target.value)}
        />
        <Button
          onClick={async () => {
            callRpc('dna_exportKey', password)
            setShowDialog(true)
          }}
          disabled={!password}
        >
          Export PK
        </Button>
      </Flex>
      <PkDialog show={showDialog} onHide={() => setShowDialog(false)}>
        <Box
          css={{
            ...margin(rem(theme.spacings.medium24)),
            textAlign: 'center',
          }}
        >
          {pk && <QRCode value={pk} />}
        </Box>
        <Box>
          <Field
            id="pk"
            label="Encrypted private key"
            defaultValue={pk}
            readonly
            disabled
            allowCopy
          />
        </Box>
      </PkDialog>
    </Section>
  )
}

// eslint-disable-next-line react/prop-types
function PkDialog({children, onHide, ...props}) {
  return (
    <Modal onHide={onHide} {...props}>
      <Box m="0 0 18px">
        <SubHeading>Encrypted private key</SubHeading>
        <Text>
          Scan QR by your mobile phone or copy code below for export private
          key.
        </Text>
        {children}
      </Box>
      <Flex align="center" justify="flex-end">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Flex>
    </Modal>
  )
}

export default Settings
