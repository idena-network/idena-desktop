/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/core'
import SettingsLayout from './layout'
import {useSettingsState} from '../../shared/providers/settings-context'
import {archiveFlips} from '../../screens/flips/utils'
import {
  SettingsSection,
  DevSettingsSection,
  SettingsLinkButton,
} from '../../screens/settings/components'
import {
  FormLabel,
  HDivider,
  Toast,
  Tooltip,
  VDivider,
} from '../../shared/components/components'
import {
  ExportPrivateKeyDialog,
  ImportPrivateKeyDialog,
  LocaleSwitcher,
} from '../../screens/settings/containers'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {t} = useTranslation()

  const toast = useToast()

  const showSuccessToast = title =>
    toast({
      // eslint-disable-next-line react/display-name
      render: () => <Toast title={title} />,
    })

  const {runInternalNode, useExternalNode} = useSettingsState()

  const {
    isOpen: isOpenExportPk,
    onOpen: onOpenExportPk,
    onClose: onCloseExportPk,
  } = useDisclosure()

  const {
    isOpen: isOpenImportPk,
    onOpen: onOpenImportPk,
    onClose: onCloseImportPk,
  } = useDisclosure()

  return (
    <SettingsLayout>
      <Stack spacing={10} mt={8}>
        <SettingsSection title={t('Language')}>
          <FormLabel color="muted" fontWeight="normal" w={32}>
            {t('Language')}
          </FormLabel>
          <LocaleSwitcher />
        </SettingsSection>

        <SettingsSection title={t('Private key')}>
          <HDivider />
          <Flex justify="space-between" align="center" py={6}>
            <Stack isInline spacing={3} align="center">
              <Icon name="key" size={5} />
              <Text fontSize="mdx" fontWeight={500}>
                {t('My private key')}
              </Text>
            </Stack>
            <Stack isInline align="center">
              <Box>
                {runInternalNode && !useExternalNode ? (
                  <SettingsLinkButton onClick={onOpenImportPk}>
                    {t('Import')}
                  </SettingsLinkButton>
                ) : (
                  <Tooltip
                    label={t('Import is not available for the external node')}
                    placement="top"
                  >
                    {/* TODO: pretending to be a Box until https://github.com/chakra-ui/chakra-ui/pull/2272 caused by https://github.com/facebook/react/issues/11972 */}
                    <SettingsLinkButton as={Box} isDisabled>
                      {t('Import')}
                    </SettingsLinkButton>
                  </Tooltip>
                )}
              </Box>
              <VDivider h={3} />
              <SettingsLinkButton onClick={onOpenExportPk}>
                {t('Export')}
              </SettingsLinkButton>
            </Stack>
          </Flex>
          <HDivider />
        </SettingsSection>

        <DevSettingsSection title={t('Flips')}>
          <Stack spacing={2}>
            <Box>
              <SettingsLinkButton
                onClick={() => {
                  clearFlips()
                  showSuccessToast(t('Flips deleted'))
                }}
              >
                {t('Clear flips')}
              </SettingsLinkButton>
            </Box>
            <Box>
              <SettingsLinkButton
                onClick={() => {
                  archiveFlips()
                  showSuccessToast(t('Flips archived'))
                }}
              >
                {t('Archive flips')}
              </SettingsLinkButton>
            </Box>
          </Stack>
        </DevSettingsSection>

        <DevSettingsSection title={t('Invites')}>
          <Box my={4}>
            <SettingsLinkButton
              onClick={() => {
                inviteDb.clearInvites()
                showSuccessToast(t('Invites removed'))
              }}
            >
              {t('Clear invites')}
            </SettingsLinkButton>
          </Box>
        </DevSettingsSection>
      </Stack>

      <ExportPrivateKeyDialog
        isOpen={isOpenExportPk}
        onClose={onCloseExportPk}
      />

      <ImportPrivateKeyDialog
        isOpen={isOpenImportPk}
        onClose={onCloseImportPk}
      />
    </SettingsLayout>
  )
}

export default Settings
