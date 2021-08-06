import {Flex, Icon, Stack, Text, useToast} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {FiLayers} from 'react-icons/fi'
import {SettingsLinkButton} from '../../screens/settings/components'
import {HDivider, Toast} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {requestDb} from '../../shared/utils/db'
import SettingsLayout from '../../screens/settings/layout'

export default function AdvancedSettings() {
  const {t} = useTranslation()

  const toast = useToast()

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      {epochState && (
        <Stack spacing={6} mt={8}>
          <HDivider />
          <Flex justify="space-between" align="center" w="md">
            <Stack isInline maxW={288}>
              <Icon as={FiLayers} size={5} />
              <Stack spacing="3/2">
                <Text fontSize="mdx" fontWeight={500}>
                  {t('Oracle voting cache')}
                </Text>
                <Text color="muted">
                  {t('Recommended in some scenarios, e.g. switching accounts.')}
                </Text>
              </Stack>
            </Stack>
            <SettingsLinkButton
              onClick={async () => {
                await global.sub(requestDb(), 'votings').clear()
                toast({
                  // eslint-disable-next-line react/display-name
                  render: () => <Toast title={t('Votings removed')} />,
                })
              }}
            >
              {t('Clear')}
            </SettingsLinkButton>
          </Flex>
          <HDivider />
        </Stack>
      )}
    </SettingsLayout>
  )
}
