import React from 'react'

import {Stack, Box, Flex, Switch, Text} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {Page, PageTitle} from '../screens/app/components'
import {UserPanel, Figure} from '../screens/profile/components'
import {IconButton2} from '../shared/components/button'
import Layout from '../shared/components/layout'
import {IdentityStatus} from '../shared/types'

export default function ProfilePage() {
  const {t} = useTranslation()

  const {
    address,
    state,
    balance,
    stake,
    penalty,
    age,
    totalShortFlipPoints,
    totalQualifiedFlips,
  } = useIdentityState()
  const epoch = useEpochState()

  return (
    <Layout>
      <Page>
        <PageTitle mb={8}>Profile</PageTitle>
        <Stack isInline spacing={10}>
          <Box>
            <UserPanel address={address} state={state} />
            <Box bg="gray.50" rounded="lg" px={10} py={6}>
              <Figure label="Address" value={address} />
              <Figure label="Balance" value={balance} measure="DNA" />

              {stake > 0 && state !== IdentityStatus.Newbie && (
                <Figure
                  label={t('Stake')}
                  value={stake}
                  postfix="DNA"
                  tooltip={t(
                    'In order to withdraw the stake you have to terminate your identity'
                  )}
                />
              )}

              {stake > 0 && state === IdentityStatus.Newbie && (
                <>
                  <Figure
                    label={t('Stake')}
                    value={stake * 0.25}
                    postfix="DNA"
                    tooltip={t(
                      'You need to get Verified status to be able to terminate your identity and withdraw the stake'
                    )}
                  />
                  <Figure
                    label={t('Locked')}
                    value={stake * 0.75}
                    postfix="DNA"
                    tooltip={t(
                      'You need to get Verified status to get the locked funds into the normal wallet'
                    )}
                  />
                </>
              )}

              {penalty > 0 && (
                <Figure
                  label={t('Mining penalty')}
                  value={penalty}
                  postfix="DNA"
                  tooltip={t(
                    "Your node was offline more than 1 hour. The penalty will be charged automaically. Once it's fully paid you'll continue to mine coins."
                  )}
                />
              )}

              <Figure label="Age" value={age} />

              {epoch && (
                <Figure
                  label="Next validation"
                  value={epoch.nextValidation.toLocaleString()}
                />
              )}

              {totalQualifiedFlips > 0 && (
                <>
                  <Figure
                    label={t('Total score')}
                    value={`${totalShortFlipPoints} out of ${totalQualifiedFlips} (${Math.round(
                      (totalShortFlipPoints / totalQualifiedFlips) * 10000
                    ) / 100}%) `}
                    tooltip={t('Total score for all validations')}
                  />
                </>
              )}
            </Box>
          </Box>
          <Box w={200}>
            <Text fontWeight={500} mt={5} mb={2}>
              Status
            </Text>
            <Flex
              justify="space-between"
              align="center"
              borderWidth={1}
              borderColor="rgb(232, 234, 237)"
              rounded="lg"
              py={2}
              px={3}
              mb={8}
            >
              <Text>Miner</Text>
              <Switch>Off</Switch>
            </Flex>
            <Stack spacing={1} align="flex-start">
              <IconButton2 icon="add-user">Invite friend</IconButton2>
              <IconButton2 icon="photo">Submit flip</IconButton2>
              <IconButton2 icon="key">Export private key</IconButton2>
              <IconButton2 icon="delete" variantColor="red">
                Terminate identity
              </IconButton2>
            </Stack>
          </Box>
        </Stack>
      </Page>
    </Layout>
  )
}
