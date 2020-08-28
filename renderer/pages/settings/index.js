/* eslint-disable react/prop-types */
import React from 'react'
import {margin} from 'polished'
import QRCode from 'qrcode.react'
import {useTranslation} from 'react-i18next'
import {Box, Text, Heading, Flex, Stack} from '@chakra-ui/core'
import {Field, Select} from '../../shared/components'
import theme, {rem} from '../../shared/theme'
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
import {archiveFlips} from '../../screens/flips/utils'
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  FormLabel,
} from '../../shared/components/components'
import {getLayout} from '../../screens/app/layout'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {t} = useTranslation()
  const {addNotification} = useNotificationDispatch()
  const {runInternalNode, useExternalNode} = useSettingsState()
  return (
    <Box mt={8}>
      {global.isDev && (
        <>
          <Section title={t('Flips')}>
            <Box>
              <PrimaryButton
                onClick={() => {
                  clearFlips()
                  addNotification({title: t('Flips deleted')})
                }}
              >
                {t('Clear flips')}
              </PrimaryButton>
            </Box>
            <Box my={theme.spacings.small}>
              <PrimaryButton
                onClick={() => {
                  archiveFlips()
                  addNotification({title: t('Flips archived')})
                }}
              >
                {t('Archive flips')}
              </PrimaryButton>
            </Box>
          </Section>
          <Section title={t('Invites')}>
            <Box my={theme.spacings.small}>
              <PrimaryButton
                onClick={() => {
                  inviteDb.clearInvites()
                  addNotification({title: t('Invites removed')})
                }}
              >
                {t('Clear invites')}
              </PrimaryButton>
            </Box>
          </Section>
        </>
      )}
      <ExportPK />
      {runInternalNode && !useExternalNode && <ImportPK />}
      <LocaleSwitcher />
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
      <Text mb={4}>
        {t('Create a new password to export your private key')}
      </Text>
      <form
        onSubmit={e => {
          e.preventDefault()
          callRpc('dna_exportKey', password)
        }}
      >
        <FormLabel htmlFor="pasword">{t('New password')}</FormLabel>
        <Stack isInline spacing={2} align="center">
          <Input
            id="pasword"
            value={password}
            type="password"
            disabled={showDialog}
            onChange={e => setPassword(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={!password}>
            {t('Export')}
          </PrimaryButton>
        </Stack>
      </form>
      <PkDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <Text>
          {t(
            'Scan QR by your mobile phone or copy code below for export privatekey.'
          )}
        </Text>
        <Flex justify="center" mx="auto" my={8}>
          <QRCode value={pk} />
        </Flex>
        <Box>
          <Field
            id="pk"
            label={t('Encrypted private key')}
            defaultValue={pk}
            readOnly
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
          body: t(
            'translation:Key was imported, please, wait, while node is restarting'
          ),
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
    <Section title={t('translation:Import private key')}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await submit()
        }}
      >
        <FormLabel htmlFor="key">
          {t('translation:Encrypted private key')}
        </FormLabel>
        <Input
          value={key}
          type="text"
          style={{
            ...margin(0, theme.spacings.normal, theme.spacings.normal, 0),
            width: rem(300),
          }}
          onChange={e => setKey(e.target.value)}
        />
        <FormLabel htmlFor="password">{t('translation:Password')}</FormLabel>
        <Input
          value={password}
          type="password"
          style={{
            ...margin(0, theme.spacings.normal, 0, 0),
            width: rem(300),
          }}
          onChange={e => setPassword(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={!password || !key}>
          {t('translation:Import')}
        </PrimaryButton>
      </form>
    </Section>
  )
}

// eslint-disable-next-line react/prop-types
function PkDialog({onClose, children, ...props}) {
  const {t} = useTranslation()
  return (
    <Dialog onClose={onClose} {...props}>
      <DialogHeader>{t('Encrypted private key')}</DialogHeader>
      <DialogBody>{children}</DialogBody>
      <DialogFooter>
        <SecondaryButton onClick={onClose}>{t('Close')}</SecondaryButton>
      </DialogFooter>
    </Dialog>
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

function Section({title, ...props}) {
  return (
    <Box mb={10}>
      <Heading fontWeight={500} fontSize="lg" mb={4}>
        {title}
      </Heading>
      <Box {...props} />
    </Box>
  )
}

Settings.getLayout = function getSettingsLayout(page, fallbackApp) {
  return getLayout(<SettingsLayout>{page}</SettingsLayout>, fallbackApp)
}

export default Settings
