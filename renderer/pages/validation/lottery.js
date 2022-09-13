import {
  Box,
  Center,
  CloseButton,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import dayjs from 'dayjs'
import NextLink from 'next/link'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {ValidationAdPromotion} from '../../screens/validation/components/ads'
import {useAutoStartValidation} from '../../screens/validation/hooks/use-start-validation'
import {ValidationCountdown} from '../../screens/validation/components/countdown'
import {ErrorAlert} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useAutoCloseValidationToast} from '../../screens/validation/hooks/use-validation-toast'
import {EpochPeriod, IdentityStatus} from '../../shared/types'
import {canValidate} from '../../screens/validation/utils'
import {useIdentity} from '../../shared/providers/identity-context'
import {Status} from '../../shared/components/sidebar'

export default function LotteryPage() {
  const {t} = useTranslation()

  const epoch = useEpochState()
  const [identity] = useIdentity()

  const isIneligible = !canValidate(identity)

  const isValidated = [
    IdentityStatus.Newbie,
    IdentityStatus.Verified,
    IdentityStatus.Human,
  ].includes(identity.state)

  useAutoStartValidation()

  useAutoCloseValidationToast()

  return (
    <Box
      bg="graphite.500"
      color="white"
      fontSize="md"
      p={['8', 0]}
      pt={['2', 0]}
      position="relative"
      w="full"
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        position={['relative', 'absolute']}
        insetX={[0, '4']}
        top={[null, '2']}
        mx={['-4', 0]}
        mb={['8', 0]}
      >
        <Status />
        <NextLink href="/home" passHref>
          <CloseButton boxSize={4} color="white" />
        </NextLink>
      </Flex>

      <Center minH="100vh">
        <Stack spacing="12" w={['xs', '640px']}>
          <Stack spacing="6">
            <Stack spacing="2">
              <Heading fontSize="lg" fontWeight={500}>
                {t('Idena validation will start soon')}
              </Heading>
              <Text color="xwhite.050" fontSize="mdx">
                {t(
                  'Get ready! Make sure you have a stable internet connection'
                )}
              </Text>
            </Stack>

            {epoch ? (
              <ValidationCountdown
                duration={
                  epoch.currentPeriod === EpochPeriod.FlipLottery
                    ? dayjs(epoch.nextValidation).diff(dayjs())
                    : 0
                }
              />
            ) : null}

            {isIneligible && (
              <ErrorAlert>
                {isValidated
                  ? t(
                      'Can not start validation session because you did not submit flips'
                    )
                  : t(
                      'Can not start validation session because you did not activate invite'
                    )}
              </ErrorAlert>
            )}
          </Stack>
          <ValidationAdPromotion />
        </Stack>
      </Center>
    </Box>
  )
}
