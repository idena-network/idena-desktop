import React from 'react'
import {margin} from 'polished'
import QRCode from 'qrcode.react'
import {useTranslation} from 'react-i18next'
import {
  Box,
  SubHeading,
  Input,
  Label,
  Button,
  Modal,
  Text,
  Field,
  Select,
} from '../../shared/components'
import theme, {rem} from '../../shared/theme'
import Flex from '../../shared/components/flex'
import useFlips from '../../shared/utils/useFlips'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import useRpc from '../../shared/hooks/use-rpc'
import SettingsLayout from './layout'
import {importKey} from '../../shared/api'
import {useNodeDispatch} from '../../shared/providers/node-context'
import {
  useSettingsState,
  useSettingsDispatch,
} from '../../shared/providers/settings-context'
import {AVAILABLE_LANGS} from '../../i18n'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {t} = useTranslation()
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()
  const {runInternalNode, useExternalNode} = useSettingsState()
  return (
    <SettingsLayout>
      {global.isDev && (
        <>
          <Section title={t('Flips')}>
            <Box>
              <Button
                onClick={() => {
                  clearFlips()
                  addNotification({title: t('Flips deleted')})
                }}
              >
                {t('Clear flips')}
              </Button>
            </Box>
            <Box my={theme.spacings.small}>
              <Button
                onClick={() => {
                  archiveFlips()
                  addNotification({title: t('Flips archived')})
                }}
              >
                {t('Archive flips')}
              </Button>
            </Box>
          </Section>
          <Section title={t('Invites')}>
            <Box my={theme.spacings.small}>
              <Button
                onClick={() => {
                  inviteDb.clearInvites()
                  addNotification({title: t('Invites removed')})
                }}
              >
                {t('Clear invites')}
              </Button>
            </Box>
          </Section>
        </>
      )}
      <ExportPK />
      {runInternalNode && !useExternalNode && <ImportPK />}
      <LocaleSwitcher />
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
  const {t} = useTranslation()
  const [{result: pk}, callRpc] = useRpc()
  const [password, setPassword] = React.useState()
  const [showDialog, setShowDialog] = React.useState()
  React.useEffect(() => setShowDialog(!!pk), [pk])
  return (
    <Section title={t('Export private key')}>
      <Text css={{marginBottom: 10}}>
        {t('Create a new password to export your private key')}
      </Text>
      <form
        onSubmit={e => {
          e.preventDefault()
          callRpc('dna_exportKey', password)
        }}
      >
        <Label>{t('New password')}</Label>
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
            {t('Export')}
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
            label={t('Encrypted private key')}
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
  const {t} = useTranslation('error')
  const [password, setPassword] = React.useState()
  const [key, setKey] = React.useState()
  const {addError, addNotification} = useNotificationDispatch()
  const {importNodeKey} = useNodeDispatch()

  const submit = async () => {
    try {
      const {error} = await importKey(key, password)
      if (error) {
        addError({
          title: t('error:Error while importing key'),
          body: error.message,
        })
      } else {
        importNodeKey()
        addNotification({
          title: 'Success',
          body: t('Key was imported, please, wait, while node is restarting'),
        })
        setKey('')
        setPassword('')
      }
    } catch (e) {
      addError({
        title: t('error:Error while importing key'),
        body: t(
          'error:Internal node is not available, try again in a few seconds'
        ),
      })
    }
  }

  return (
    <Section title={t('Import private key')}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await submit()
        }}
      >
        <Label htmlFor="key">{t('Encrypted private key')}</Label>
        <Input
          value={key}
          type="text"
          style={{
            ...margin(0, theme.spacings.normal, theme.spacings.normal, 0),
            width: rem(300),
          }}
          onChange={e => setKey(e.target.value)}
        />
        <Label htmlFor="password">{t('Password')}</Label>
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
          {t('Import')}
        </Button>
      </form>
    </Section>
  )
}

// eslint-disable-next-line react/prop-types
function PkDialog({children, onHide, ...props}) {
  const {t} = useTranslation()
  return (
    <Modal onHide={onHide} {...props}>
      <Box m="0 0 18px">
        <SubHeading>{t('Encrypted private key')}</SubHeading>
        <Text>
          {t(
            'Scan QR by your mobile phone or copy code below for export privatekey.'
          )}
        </Text>
        {children}
      </Box>
      <Flex align="center" justify="flex-end">
        <Button variant="secondary" onClick={onHide}>
          {t('Close')}
        </Button>
      </Flex>
    </Modal>
  )
}

function LocaleSwitcher() {
  const {t, i18n} = useTranslation()
  const {changeLanguage} = useSettingsDispatch()
  return (
    <Section title={t('Language')}>
      <Box w={rem(300)}>
        <Select
          name="lng"
          id="lng"
          options={AVAILABLE_LANGS}
          value={i18n.language}
          onChange={e => {
            i18n.changeLanguage(e.target.value)
            changeLanguage(e.target.value)
          }}
        />
      </Box>
    </Section>
  )
}

export default Settings
