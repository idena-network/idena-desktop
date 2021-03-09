/* eslint-disable react/prop-types */
import React from 'react'
import {
  Box,
  Flex,
  FormControl,
  Heading,
  Select,
  Stack,
  Text,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import QRCode from 'qrcode.react'
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  FormLabel,
  Input,
} from '../../shared/components/components'
import useRpc from '../../shared/hooks/use-rpc'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {Field} from '../../shared/components'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {useNodeDispatch} from '../../shared/providers/node-context'
import {importKey} from '../../shared/api'
import {useSettingsDispatch} from '../../shared/providers/settings-context'
import {AVAILABLE_LANGS, flagEmojis} from '../../i18n'

export function ExportPK() {
  const {t} = useTranslation()

  const [{result: pk}, callRpc] = useRpc()

  const [password, setPassword] = React.useState()

  const [showDialog, setShowDialog] = React.useState()

  React.useEffect(() => setShowDialog(!!pk), [pk])

  return (
    <Box>
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
      <ExportPkDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
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
      </ExportPkDialog>
    </Box>
  )
}

export function ImportPK() {
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
    <form
      onSubmit={async e => {
        e.preventDefault()
        await submit()
      }}
    >
      <FormLabel htmlFor="key">
        {t('translation:Encrypted private key')}
      </FormLabel>
      <SettingsInput
        value={key}
        type="text"
        mr={4}
        onChange={e => setKey(e.target.value)}
      />
      <FormLabel htmlFor="password">{t('translation:Password')}</FormLabel>
      <SettingsInput
        value={password}
        type="password"
        mr={4}
        onChange={e => setPassword(e.target.value)}
      />
      <PrimaryButton type="submit" disabled={!password || !key}>
        {t('translation:Import')}
      </PrimaryButton>
    </form>
  )
}

function ExportPkDialog({onClose, children, ...props}) {
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

export function LocaleSwitcher() {
  const {i18n} = useTranslation()
  const {changeLanguage} = useSettingsDispatch()
  return (
    <Box w="xs">
      <Select
        name="lng"
        id="lng"
        options={AVAILABLE_LANGS}
        value={i18n.language}
        onChange={e => {
          i18n.changeLanguage(e.target.value)
          changeLanguage(e.target.value)
        }}
      >
        {AVAILABLE_LANGS.map(lang => (
          <option key={lang} value={lang}>
            {flagEmojis[lang]}&nbsp;{lang}
          </option>
        ))}
      </Select>
    </Box>
  )
}

export function SettingsFormControl({children, ...props}) {
  return (
    <FormControl {...props}>
      <Stack isInline spacing={2} justify="space-between" align="center" w="md">
        {children}
      </Stack>
    </FormControl>
  )
}

export function SettingsFormLabel(props) {
  return <FormLabel color="muted" fontWeight={400} {...props} />
}

export function SettingsInput(props) {
  return <Input w="xs" {...props} />
}

export function SettingsSection({title, children, ...props}) {
  return (
    <Box {...props}>
      <Heading fontWeight={500} fontSize="lg" mb={4}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

export function DevSettingsSection(props) {
  return global.isDev ? <SettingsSection {...props} /> : null
}
