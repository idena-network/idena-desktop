import {Box, Stack, Text, useToast} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {SettingsSection} from '../../screens/settings/components'
import {PrimaryButton} from '../../shared/components/button'
import {Toast} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {requestDb} from '../../shared/utils/db'
import SettingsLayout from './layout'

export default function AdsSettings() {
  const {t} = useTranslation()

  const toast = useToast()

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      <Stack spacing={8} mt={8}>
        {epochState && (
          <SettingsSection title={t('Ads cache')}>
            <Stack spacing={4} align="flex-start" my={4}>
              <Box color="muted">
                <Text>{t('Clear persisted ads.')}</Text>
                <Text color="muted">
                  {t('Recommended in some scenarios, e.g. switching accounts.')}
                </Text>
              </Box>
              <PrimaryButton
                onClick={async () => {
                  await global.sub(requestDb(), 'ads').clear()
                  toast({
                    // eslint-disable-next-line react/display-name
                    render: () => <Toast title={t('Ads removed')} />,
                  })
                }}
              >
                {t('Clear cache')}
              </PrimaryButton>
            </Stack>
          </SettingsSection>
        )}
      </Stack>
    </SettingsLayout>
  )
}
