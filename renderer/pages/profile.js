import React from 'react'
import {
  Stack,
  Box,
  Flex,
  Switch,
  Text,
  Icon,
  useDisclosure,
  useToast,
} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import dayjs from 'dayjs'
import {useMachine} from '@xstate/react'
import {useIdentityState} from '../shared/providers/identity-context'
import {useEpochState} from '../shared/providers/epoch-context'
import {
  Page,
  PageTitle,
  IssueInviteDrawer,
  IssueInviteForm,
} from '../screens/app/components'
import {
  UserInlineCard,
  SimpleUserStat,
  UserStatList,
  UserStat,
  UserStatLabel,
  UserStatValue,
  AnnotatedUserStat,
} from '../screens/profile/components'
import {IconButton2} from '../shared/components/button'
import {IconLink} from '../shared/components/link'
import Layout from '../shared/components/layout'
import {IdentityStatus, InviteStatus} from '../shared/types'
import {useChainState} from '../shared/providers/chain-context'
import {toPercent, toLocaleDna} from '../shared/utils/utils'
import {Toast, Debug} from '../shared/components/components'
import {invitesMachine} from '../shared/machines'

export default function ProfilePage() {
  const {
    t,
    i18n: {language},
  } = useTranslation()

  const toDna = toLocaleDna(language)

  const {
    isOpen: isOpenInviteForm,
    onOpen: onOpenInviteForm,
    onClose: onCloseInviteForm,
  } = useDisclosure()

  const toast = useToast()

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
    invites: knownInvitationsNumber,
  } = useIdentityState()

  const epoch = useEpochState()

  const [currentInvites, sendInvites] = useMachine(invitesMachine, {
    context: {
      epoch: epoch?.epoch,
    },
    actions: {
      onInviteSubmitted: (_, {hash}) => {
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={t('Invitation code created')} description={hash} />
          ),
        })
        onCloseInviteForm()
      },
      onSubmitInviteFailed: (_, {error}) =>
        toast({
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast
              title={error?.message ?? t('Something went wrong')}
              status="error"
            />
          ),
        }),
    },
  })

  React.useEffect(() => {
    if (epoch && currentInvites.matches('idle'))
      sendInvites('EPOCH', {epoch: epoch.epoch})
  }, [currentInvites, epoch, sendInvites])

  const {invites} = currentInvites.context
  const issuingInvites = invites.filter(
    ({status}) => status === InviteStatus.Issuing
  )

  const availableInvitationsNumber =
    knownInvitationsNumber - issuingInvites.length

  const isExceededInvitationsNumber = availableInvitationsNumber < 1

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page>
        <PageTitle mb={8}>{t('Profile')}</PageTitle>
        <Stack isInline spacing={10}>
          <Box>
            <UserInlineCard address={address} state={state} />
            <UserStatList>
              <SimpleUserStat label="Address" value={address} />
              <UserStat>
                <UserStatLabel>{t('Balance')}</UserStatLabel>
                <UserStatValue>{toDna(balance)}</UserStatValue>
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
              <IconButton2
                isDisabled={isExceededInvitationsNumber}
                icon="add-user"
                onClick={onOpenInviteForm}
              >
                {t('Invite')}{' '}
                {`(${Math.max(availableInvitationsNumber, 0)} available)`}
              </IconButton2>
              <IconLink href="/flips/new" icon={<Icon name="photo" size={5} />}>
                {t('New flip')}
              </IconLink>
              <IconButton2 icon="delete" variantColor="red">
                {t('Terminate identity')}
              </IconButton2>
            </Stack>
          </Box>
        </Stack>

        <IssueInviteDrawer
          isOpen={isOpenInviteForm}
          onClose={onCloseInviteForm}
        >
          <IssueInviteForm
            onIssueInvite={async invite =>
              sendInvites('ISSUE_INVITE', {invite})
            }
          />
        </IssueInviteDrawer>

        <Debug>
          {{value: currentInvites.value, context: currentInvites.context}}
        </Debug>
      </Page>
    </Layout>
  )
}
