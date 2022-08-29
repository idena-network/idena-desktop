import React from 'react'
import NextLink from 'next/link'
import {
  Box,
  Button,
  HStack,
  Stack,
  Text,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {
  IconLink,
  FloatDebug,
  HDivider,
  Toast,
  VDivider,
  Page,
  PageTitle,
} from '../../shared/components/components'
import {votingListMachine} from '../../screens/oracles/machines'
import {
  VotingCardSkeleton,
  VotingSkeleton,
  FillPlaceholder,
  FillCenter,
  OutlineButton,
  ScrollToTop,
  TodoVotingCountBadge,
} from '../../screens/oracles/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {
  VotingCard,
  VotingFilter,
  LaunchVotingDrawer,
} from '../../screens/oracles/containers'
import {useIdentityState} from '../../shared/providers/identity-context'
import {eitherState} from '../../shared/utils/utils'
import {VotingListFilter} from '../../screens/oracles/types'
import {
  humanError,
  mapVotingStatus,
  votingStatuses,
} from '../../screens/oracles/utils'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {IdentityStatus} from '../../shared/types'
import {useVotingNotification} from '../../shared/providers/voting-notification-context'
import {PlusSolidIcon, UserIcon} from '../../shared/components/icons'

export default function VotingListPage() {
  const {t} = useTranslation()

  const toast = useToast()

  const pageRef = React.useRef()

  const {offline, syncing} = useChainState()
  const {address, state} = useIdentityState()
  const {epoch} = useEpochState() ?? {epoch: -1}

  const [, {resetLastVotingTimestamp}] = useVotingNotification()

  const [current, send] = useMachine(votingListMachine, {
    context: {epoch, address},
    actions: {
      onError: (context, {data: {message}}) => {
        toast({
          status: 'error',
          // eslint-disable-next-line react/display-name
          render: () => (
            <Toast title={humanError(message, context)} status="error" />
          ),
        })
      },
      onResetLastVotingTimestamp: resetLastVotingTimestamp,
    },
  })

  const {
    votings,
    filter,
    statuses,
    continuationToken,
    startingVotingRef,
  } = current.context

  const [{todoCount}] = useVotingNotification()

  return (
    <Layout syncing={syncing} offline={offline}>
      <Page ref={pageRef}>
        <PageTitle mb={4}>{t('Oracle voting')}</PageTitle>
        <Stack isInline spacing={20} w="full" flex={1}>
          <Stack spacing={8}>
            <VotingSkeleton isLoaded={!current.matches('preload')}>
              <HStack>
                <Button
                  variant="tab"
                  isActive={filter === VotingListFilter.Todo}
                  onClick={() => send('FILTER', {value: VotingListFilter.Todo})}
                >
                  {todoCount > 0 ? (
                    <Stack isInline spacing={1} align="center">
                      <Text as="span">{t('To Do')}</Text>
                      <TodoVotingCountBadge>{todoCount}</TodoVotingCountBadge>
                    </Stack>
                  ) : (
                    t('To Do')
                  )}
                </Button>
                <Button
                  variant="tab"
                  isActive={filter === VotingListFilter.Voting}
                  onClick={() =>
                    send('FILTER', {value: VotingListFilter.Voting})
                  }
                >
                  {t('Running')}
                </Button>
                <Button
                  variant="tab"
                  isActive={filter === VotingListFilter.Closed}
                  onClick={() =>
                    send('FILTER', {value: VotingListFilter.Closed})
                  }
                >
                  {t('Closed')}
                </Button>
                <Button
                  variant="tab"
                  isActive={filter === 'all'}
                  onClick={() => send('FILTER', {value: 'all'})}
                >
                  {t('All')}
                </Button>
                <VDivider />
                <Button
                  variant="tab"
                  value={filter === 'own'}
                  onClick={() => send('FILTER', {value: 'own'})}
                >
                  <Stack isInline>
                    <UserIcon boxSize="4" />
                    <Text>{t('My votings')}</Text>
                  </Stack>
                </Button>
              </HStack>
            </VotingSkeleton>
            <Stack spacing={6} w="md" flex={1}>
              {current.matches('failure') && (
                <FillPlaceholder>
                  {current.context.errorMessage}
                </FillPlaceholder>
              )}

              {eitherState(current, 'loading.late') &&
                Array.from({length: 5}).map((_, idx) => (
                  <VotingCardSkeleton key={idx} />
                ))}

              {current.matches('loaded') && votings.length === 0 && (
                <FillCenter justify="center">
                  <Stack spacing={4}>
                    <Text color="muted" textAlign="center">
                      {/* eslint-disable-next-line no-nested-ternary */}
                      {filter === VotingListFilter.Own
                        ? t(`There are no votings yet.`)
                        : [
                            IdentityStatus.Newbie,
                            IdentityStatus.Verified,
                            IdentityStatus.Human,
                          ].includes(state)
                        ? t(`There are no votings for you`)
                        : t(
                            `There are no votings for you because your status is not validated.`
                          )}
                    </Text>
                    <Box alignSelf="center">
                      <NextLink href="/oracles/new">
                        <OutlineButton>{t('Create new voting')}</OutlineButton>
                      </NextLink>
                    </Box>
                  </Stack>
                </FillCenter>
              )}

              {current.matches('loaded') &&
                votings.map(({id, ref}, idx) => (
                  <Stack key={id} spacing={6}>
                    <VotingCard votingRef={ref} />
                    {idx < votings.length - 1 && <HDivider mt={0} mb={0} />}
                  </Stack>
                ))}

              {current.matches('loaded') && continuationToken && (
                <OutlineButton
                  alignSelf="center"
                  isLoading={current.matches('loaded.loadingMore')}
                  loadingText={t('Loading')}
                  onClick={() => send('LOAD_MORE')}
                >
                  {t('Load more votings')}
                </OutlineButton>
              )}
            </Stack>
          </Stack>
          <VotingSkeleton isLoaded={!current.matches('preload')}>
            <Stack spacing={8} align="flex-start" w={48}>
              <IconLink
                href="/oracles/new"
                icon={<PlusSolidIcon boxSize="5" />}
                ml={-2}
              >
                {t('New voting')}
              </IconLink>
              <Stack>
                <Text fontWeight={500}>{t('Tags')}</Text>
                {!current.matches('preload') && (
                  <Wrap spacing={2}>
                    {votingStatuses(filter).map(status => (
                      <WrapItem>
                        <VotingFilter
                          key={status}
                          isChecked={statuses.includes(status)}
                          status={status}
                          cursor="pointer"
                          onClick={() => {
                            send('TOGGLE_STATUS', {value: status})
                          }}
                        >
                          {t(mapVotingStatus(status))}
                        </VotingFilter>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </Stack>
            </Stack>
          </VotingSkeleton>
        </Stack>

        {startingVotingRef && (
          <LaunchVotingDrawer votingService={startingVotingRef} />
        )}

        <ScrollToTop scrollableRef={pageRef}>{t('Back to top')}</ScrollToTop>

        {global.isDev && <FloatDebug>{current.value}</FloatDebug>}
      </Page>
    </Layout>
  )
}
