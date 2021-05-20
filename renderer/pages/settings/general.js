/* eslint-disable react/prop-types */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Box,
  Button,
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
import {PrimaryButton} from '../../shared/components/button'
import {
  SettingsSection,
  DevSettingsSection,
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
                  <Button
                    variant="link"
                    variantColor="blue"
                    fontWeight={500}
                    _hover={null}
                    _active={null}
                    onClick={onOpenImportPk}
                  >
                    {t('Import')}
                  </Button>
                ) : (
                  <Tooltip
                    label={t('Import is not available for the external node')}
                    placement="top"
                  >
                    {/* TODO: pretending to be a Box until https://github.com/chakra-ui/chakra-ui/pull/2272 caused by https://github.com/facebook/react/issues/11972 */}
                    <Button
                      as={Box}
                      variant="link"
                      isDisabled
                      fontWeight={500}
                      _hover={null}
                      _active={null}
                      _disabled={{
                        color: 'muted',
                      }}
                    >
                      {t('Import')}
                    </Button>
                  </Tooltip>
                )}
              </Box>
              <VDivider h={3} />
              <Button
                variant="link"
                variantColor="blue"
                fontWeight={500}
                _hover={null}
                _active={null}
                onClick={onOpenExportPk}
              >
                {t('Export')}
              </Button>
            </Stack>
          </Flex>
          <HDivider />
        </SettingsSection>

        <DevSettingsSection title={t('Flips')}>
          <Stack spacing={2}>
            <Box>
              <PrimaryButton
                onClick={() => {
                  clearFlips()
                  showSuccessToast(t('Flips deleted'))
                }}
              >
                {t('Clear flips')}
              </PrimaryButton>
            </Box>
            <Box>
              <PrimaryButton
                onClick={() => {
                  archiveFlips()
                  showSuccessToast(t('Flips archived'))
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
                showSuccessToast(t('Invites removed'))
              }}
            >
              {t('Clear invites')}
            </PrimaryButton>
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
