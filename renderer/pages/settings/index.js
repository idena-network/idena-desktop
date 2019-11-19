import React from 'react'
import {margin, rem} from 'polished'
import QRCode from 'qrcode.react'

import {
  Box,
  SubHeading,
  Input,
  Label,
  Button,
  Modal,
  Text,
  Field,
} from '../../shared/components'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import useFlips from '../../shared/utils/useFlips'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import useRpc from '../../shared/hooks/use-rpc'
import SettingsLayout from './layout'
import {importKey} from '../../shared/api'
import {useNodeDispatch} from '../../shared/providers/node-context'
import {useSettingsState} from '../../shared/providers/settings-context'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()
  const {useInternalNode} = useSettingsState()
  return (
    <SettingsLayout>
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
        </>
      )}
      <ExportPK />
      {useInternalNode && <ImportPK />}
    </SettingsLayout>
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
  React.useEffect(() => setShowDialog(!!pk), [pk])
  return (
    <Section title="Export private key">
      <form
        onSubmit={e => {
          e.preventDefault()
          callRpc('dna_exportKey', password)
        }}
      >
        <Label htmlFor="url">Password</Label>
        <Flex align="center">
          <Input
            value={password}
            type="password"
            style={{
              ...margin(0, theme.spacings.normal, 0, 0),
              width: rem(300),
            }}
            disabled={showDialog}
            onChange={e => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={!password}>
            Export PK
          </Button>
        </Flex>
      </form>
      <PkDialog show={showDialog} onHide={() => setShowDialog(false)}>
        <Box
          css={{
            ...margin(rem(theme.spacings.medium24)),
            textAlign: 'center',
          }}
        >
          <QRCode value={pk} />
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

function ImportPK() {
  const [password, setPassword] = React.useState()
  const [key, setKey] = React.useState()
  const {addError, addNotification} = useNotificationDispatch()
  const {importNodeKey} = useNodeDispatch()

  const submit = async () => {
    try {
      const {error} = await importKey(key, password)
      if (error) {
        addError({title: 'Error while importing key', body: error.message})
      } else {
        importNodeKey()
        addNotification({
          title: 'Success',
          body: 'Key was imported. Please, wait, while node is restarting.',
        })
        setKey('')
        setPassword('')
      }
    } catch (e) {
      addError({
        title: 'Error while importing key',
        body: 'Internal node is not available. Try again in a few seconds.',
      })
    }
  }

  return (
    <Section title="Import private key">
      <form
        onSubmit={async e => {
          e.preventDefault()
          await submit()
        }}
      >
        <Label htmlFor="key">Key</Label>
        <Input
          value={key}
          type="text"
          style={{
            ...margin(0, theme.spacings.normal, 0, 0),
            width: rem(300),
          }}
          onChange={e => setKey(e.target.value)}
        />
        <Label htmlFor="password">Password</Label>
        <Input
          value={password}
          type="password"
          style={{
            ...margin(0, theme.spacings.normal, 0, 0),
            width: rem(300),
          }}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={!password || !key}>
          Import PK
        </Button>
      </form>
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
