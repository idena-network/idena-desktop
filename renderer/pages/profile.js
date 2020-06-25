import React from 'react'
import {
  Stack,
  Box,
  Flex,
  Switch,
  Text,
  Icon,
  useDisclosure,
  Heading,
  Image,
  FormControl,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {Page, PageTitle} from '../screens/app/components'
import {
  UserCard,
  SimpleUserStat,
  UserStatList,
  UserStat,
  UserStatLabel,
  UserStatValue,
  AnnotatedUserStat,
} from '../screens/profile/components'
import {IconButton2, PrimaryButton} from '../shared/components/button'
import {IconLink} from '../shared/components/link'
import Layout from '../shared/components/layout'
import {IdentityStatus} from '../shared/types'
import {
  DrawerBody,
  DrawerHeader,
  Drawer,
  Input,
  FormLabel,
} from '../shared/components/components'
import {sendInvite} from '../shared/api'
import {Notification} from '../shared/components/notifications'
import {useChainState} from '../shared/providers/chain-context'
import {toPercent, toDna} from '../shared/utils/utils'

export default function ProfilePage() {
  const {t} = useTranslation()

  const {syncing, offline} = useChainState()

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

  const {
    isOpen: isOpenInviteForm,
    onOpen: onOpenInviteForm,
    onClose: onCloseInviteForm,
  } = useDisclosure()

  const toast = useToast()

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page>
        <PageTitle mb={8}>{t('Profile')}</PageTitle>
        <Stack isInline spacing={10}>
          <Box>
            <UserCard address={address} state={state} />
            <UserStatList>
              <SimpleUserStat label="Address" value={address} />
              <UserStat>
                <UserStatLabel>{t('Balance')}</UserStatLabel>
                <UserStatValue>{balance} DNA</UserStatValue>
              </UserStat>
              {stake > 0 && state === IdentityStatus.Newbie && (
                <>
                  <AnnotatedUserStat
                    annotation={t(
                      'You need to get Verified status to be able to terminate your identity and withdraw the stake'
                    )}
                    label={t('Stake')}
                    value={toDna(stake * 0.25)}
                  />
                  <AnnotatedUserStat
                    annotation={t(
                      'You need to get Verified status to get the locked funds into the normal wallet'
                    )}
                    label={t('Locked')}
                    value={toDna(stake * 0.75)}
                  />
                </>
              )}

              {stake > 0 && state !== IdentityStatus.Newbie && (
                <AnnotatedUserStat
                  annotation={t(
                    'In order to withdraw the stake you have to terminate your identity'
                  )}
                  label={t('Stake')}
                  value={toDna(stake)}
                />
              )}

              {penalty > 0 && (
                <AnnotatedUserStat
                  annotation={t(
                    "Your node was offline more than 1 hour. The penalty will be charged automaically. Once it's fully paid you'll continue to mine coins."
                  )}
                  label={t('Mining penalty')}
                  value={toDna(penalty)}
                />
              )}
              {age > 0 && <SimpleUserStat label="Age" value={age} />}
              {epoch && (
                <SimpleUserStat
                  label="Next validation"
                  value={dayjs(epoch.nextValidation).toString()}
                />
              )}
              {totalQualifiedFlips > 0 && (
                <AnnotatedUserStat
                  annotation={t('Total score for all validations')}
                  label={t('Total score')}
                >
                  <UserStatValue>
                    {totalShortFlipPoints} out of {totalQualifiedFlips} (
                    {toPercent(totalShortFlipPoints / totalQualifiedFlips)})
                  </UserStatValue>
                </AnnotatedUserStat>
              )}
            </UserStatList>
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
              <IconButton2 icon="add-user" onClick={onOpenInviteForm}>
                {t('Invite')}
              </IconButton2>
              <IconLink href="/flips/new" icon={<Icon name="photo" size={5} />}>
                {t('New flip')}
              </IconLink>
              <IconButton2 icon="delete" variantColor="red">
                {t('Terminate')}
              </IconButton2>
            </Stack>
          </Box>
        </Stack>

        <Drawer isOpen={isOpenInviteForm} onClose={onCloseInviteForm}>
          <DrawerHeader>
            <Image
              size={20}
              src={`https://robohash.org/0x${'2'.repeat(64)}`}
              bg="gray.50"
              mx="auto"
              rounded="lg"
            />
            <Heading
              fontSize="lg"
              fontWeight={500}
              color="brandGray.500"
              mt={4}
              textAlign="center"
            >
              {t('Invite new person')}
            </Heading>
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={6} mt={6}>
              <Stack isInline spacing={4}>
                <FormControl>
                  <FormLabel htmlFor="firstName">{t('First name')}</FormLabel>
                  <Input id="firstName" py={2} />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="lastName">{t('Last name')}</FormLabel>
                  <Input id="lastName" />
                </FormControl>
              </Stack>
              <PrimaryButton
                isDisabled={false}
                ml="auto"
                onClick={async () => {
                  try {
                    const {result} = await sendInvite({to: null})
                    toast({
                      status: 'success',
                      duration: 5000,
                      // eslint-disable-next-line react/display-name
                      render: () => (
                        <Box fontSize="md">
                          <Notification
                            title={t('Invitation code created')}
                            description={result}
                          />
                        </Box>
                      ),
                    })
                    onCloseInviteForm()
                  } catch (error) {
                    toast({
                      title: error.message,
                      status: 'error',
                      duration: 9000,
                      isClosable: true,
                    })
                  }
                }}
              >
                {t('Create invitation')}
              </PrimaryButton>
            </Stack>
          </DrawerBody>
        </Drawer>
      </Page>
    </Layout>
  )
}
