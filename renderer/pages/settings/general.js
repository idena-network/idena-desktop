/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Box, Stack, useToast} from '@chakra-ui/core'
import SettingsLayout from './layout'
import {useSettingsState} from '../../shared/providers/settings-context'
import {archiveFlips} from '../../screens/flips/utils'
import {getLayout} from '../../screens/app/layout'
import {PrimaryButton} from '../../shared/components/button'
import {
  ExportPK,
  ImportPK,
  LocaleSwitcher,
  SettingsSection,
  DevSettingsSection,
} from '../../screens/settings/components'
import {epochDb} from '../../shared/utils/db'
import {useEpochState} from '../../shared/providers/epoch-context'
import {Toast} from '../../shared/components/components'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {t} = useTranslation()

  const toast = useToast()
  const toastify = title =>
    toast({
      // eslint-disable-next-line react/display-name
      render: () => <Toast title={title} />,
    })

  const {runInternalNode, useExternalNode} = useSettingsState()

  const {epoch} = useEpochState()

  return (
    <Stack spacing={10} mt={8}>
      <DevSettingsSection title={t('Flips')} as={Stack} spacing={2}>
        <Box>
          <PrimaryButton
            onClick={() => {
              clearFlips()
              toastify(t('Flips deleted'))
            }}
          >
            {t('Clear flips')}
          </PrimaryButton>
        </Box>
        <Box>
          <PrimaryButton
            onClick={() => {
              archiveFlips()
              toastify(t('Flips archived'))
            }}
          >
            {t('Archive flips')}
          </PrimaryButton>
        </Box>
      </DevSettingsSection>

      <DevSettingsSection title={t('Invites')}>
        <Box my={4}>
          <PrimaryButton
            onClick={() => {
              inviteDb.clearInvites()
              toastify(t('Invites removed'))
            }}
          >
            {t('Clear invites')}
          </PrimaryButton>
        </Box>
      </DevSettingsSection>

      <DevSettingsSection title={t('Oracles')}>
        <Box my={4}>
          <PrimaryButton
            onClick={async () => {
              await epochDb('votings', epoch).clear()
              toastify(t('Votings removed'))
            }}
          >
            {t('Clear votings')}
          </PrimaryButton>
        </Box>
      </DevSettingsSection>

      <SettingsSection title={t('Export private key')}>
        <ExportPK />
      </SettingsSection>

      {runInternalNode && !useExternalNode && (
        <SettingsSection title={t('Import private key')}>
          <ImportPK />
        </SettingsSection>
      )}

      <SettingsSection title={t('Language')}>
        <LocaleSwitcher />
      </SettingsSection>
    </Stack>
  )
}

Settings.getLayout = function getSettingsLayout(page, fallbackApp) {
  return getLayout(<SettingsLayout>{page}</SettingsLayout>, fallbackApp)
}

export default Settings
