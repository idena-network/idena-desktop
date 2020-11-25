/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {Box, Stack, useToast} from '@chakra-ui/core'
import SettingsLayout from './layout'
import {useSettingsState} from '../../shared/providers/settings-context'
import {archiveFlips} from '../../screens/flips/utils'
import {PrimaryButton} from '../../shared/components/button'
import {
  ExportPK,
  ImportPK,
  LocaleSwitcher,
  SettingsSection,
  DevSettingsSection,
} from '../../screens/settings/components'
import {epochDb} from '../../shared/utils/db'
import {Toast} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'

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

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      <Stack spacing={10} mt={8}>
        <DevSettingsSection title={t('Flips')}>
          <Stack spacing={2}>
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
          </Stack>
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

        {epochState && (
          <SettingsSection title={t('Oracles')}>
            <Box my={4}>
              <PrimaryButton
                onClick={async () => {
                  await epochDb('votings', epochState.epoch).clear()
                  toastify(t('Votings removed'))
                }}
              >
                {t('Clear votings')}
              </PrimaryButton>
            </Box>
          </SettingsSection>
        )}

        <SettingsSection title={t('Export private key')}>
          <ExportPK />
        </SettingsSection>

        {runInternalNode && !useExternalNode && (
          <Box>
            <SettingsSection title={t('Import private key')}>
              <ImportPK />
            </SettingsSection>
          </Box>
        )}

        <SettingsSection title={t('Language')}>
          <LocaleSwitcher />
        </SettingsSection>
      </Stack>
    </SettingsLayout>
  )
}

export default Settings
