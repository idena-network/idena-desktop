import {Flex, Stack, Text} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {SettingsLinkButton} from '../../screens/settings/components'
import {HDivider} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {requestDb} from '../../shared/utils/db'
import SettingsLayout from '../../screens/settings/layout'
import {useSuccessToast} from '../../shared/hooks/use-toast'
import {LayersIcon} from '../../shared/components/icons'

export default function AdvancedSettings() {
  const {t} = useTranslation()

  const toast = useSuccessToast()

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      {epochState && (
        <Stack spacing="6" mt="8">
          <HDivider />
          <Flex justify="space-between" align="center" w="md">
            <Stack isInline maxW={288}>
              <LayersIcon boxSize="5" />
              <Stack spacing="1.5">
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
                toast(t('Votings removed'))
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
