import {Box, Stack, Text} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {createAdDb} from '../../screens/ads/utils'
import {SettingsSection} from '../../screens/settings/components'
import {PrimaryButton} from '../../shared/components/button'
import {useSuccessToast} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {callRpc} from '../../shared/utils/utils'
import SettingsLayout from './layout'

export default function AdsSettings() {
  const {t} = useTranslation()

  const toast = useSuccessToast()

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      <Stack spacing={8} mt={8}>
        <Stack spacing={10}>
          {epochState && (
            <SettingsSection title={t('Ads cache')}>
              <Stack spacing={4} align="flex-start">
                <Box color="muted">
                  <Text>{t('Clear persisted ads.')}</Text>
                  <Text color="muted">
                    {t(
                      'Recommended in some scenarios, e.g. switching accounts.'
                    )}
                  </Text>
                </Box>
                <PrimaryButton
                  onClick={async () => {
                    await createAdDb(epochState.epoch).clear()
                    toast(t('Ads removed'))
                  }}
                >
                  {t('Clear cache')}
                </PrimaryButton>
              </Stack>
            </SettingsSection>
          )}
          <SettingsSection title={t('Profile')}>
            <Stack spacing={4} align="flex-start" my={4}>
              <Box color="muted">
                <Text color="muted">
                  {t('Start over with the fresh profile.')}
                </Text>
              </Box>
              <PrimaryButton
                onClick={async () => {
                  await callRpc('dna_changeProfile', {info: '0x'})
                  toast(t('Profile reset'))
                }}
              >
                {t('Reset profile')}
              </PrimaryButton>
            </Stack>
          </SettingsSection>
        </Stack>
      </Stack>
    </SettingsLayout>
  )
}
