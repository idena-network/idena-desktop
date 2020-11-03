import React from 'react'
import NextLink from 'next/link'
import {Button, Icon, Link, Stack, Text, useToast} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipFilter as FilterList,
  FlipFilterOption as FilterOption,
} from '../../screens/flips/components'
import {IconLink} from '../../shared/components/link'
import {FloatDebug, Toast, VDivider} from '../../shared/components/components'
import {votingListMachine} from '../../screens/oracles/machines'
import {
  VotingCardSkeleton,
  VotingSkeleton,
  FillPlaceholder,
  FillCenter,
} from '../../screens/oracles/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VotingCard, VotingFilter} from '../../screens/oracles/containers'
import {useIdentityState} from '../../shared/providers/identity-context'
import {eitherState} from '../../shared/utils/utils'
import {VotingListFilter} from '../../screens/oracles/types'
import {votingStatuses} from '../../screens/oracles/utils'

function VotingListPage() {
  const {t} = useTranslation()

  const toast = useToast()

  const identity = useIdentityState()
  const epoch = useEpochState()

  const [current, send] = useMachine(votingListMachine, {
    context: {epoch, identity},
    actions: {
      onError: (_, {data: {message}}) => {
        toast({
          status: 'error',
          // eslint-disable-next-line react/display-name
          render: () => <Toast title={message} status="error" />,
        })
      },
    },
  })
  const {votings, filter, statuses = '', continuationToken} = current.context

  return (
    <Page>
      <PageTitle mb={4}>{t('Oracle votings')}</PageTitle>
      <Stack isInline spacing={20} w="full" flex={1}>
        <Stack spacing={8}>
          <VotingSkeleton isLoaded={!current.matches('preload')}>
            <FilterList
              value={filter}
              display="flex"
              alignItems="center"
              onChange={value => {
                send('FILTER', {value})
              }}
            >
              <FilterOption value={VotingListFilter.Todo}>
                {t('To Do')}
              </FilterOption>
              <FilterOption value={VotingListFilter.Voting}>
                {t('Voting')}
              </FilterOption>
              <FilterOption value={VotingListFilter.Closed}>
                {t('Closed')}
              </FilterOption>
              <FilterOption value="all">{t('All')}</FilterOption>
              <VDivider />
              <FilterOption value="own">
                <Stack isInline>
                  <Icon name="user" size={4} />
                  <Text>{t('My votings')}</Text>
                </Stack>
              </FilterOption>
            </FilterList>
          </VotingSkeleton>
          <Stack spacing={6} w="md" flex={1}>
            {current.matches('failure') && (
              <FillPlaceholder>{current.context.errorMessage}</FillPlaceholder>
            )}

            {eitherState(current, 'loading.late') &&
              Array.from({length: 5}).map((_, idx) => (
                <VotingCardSkeleton key={idx} />
              ))}

            {current.matches('loaded') && votings.length === 0 && (
              <FillCenter justify="center">
                <>
                  {filter === VotingListFilter.Own && (
                    <Text>{t(`There are no votings yet.`)}</Text>
                  )}

                  {filter !== VotingListFilter.Own && (
                    <Text>
                      {identity.isValidated
                        ? t(`No votings for you 🤷‍♂️`)
                        : t(`There are no votings yet.`)}
                    </Text>
                  )}

                  <NextLink href="/oracles/new">
                    <Link
                      color="brandBlue.500"
                      fontWeight={500}
                      _hover={{
                        textDecoration: 'none',
                      }}
                    >
                      {t('Create new voting')}
                    </Link>
                  </NextLink>
                </>
              </FillCenter>
            )}

            {current.matches('loaded') &&
              votings.map(({id, ref}) => (
                <VotingCard key={id} votingRef={ref} />
              ))}

            {current.matches('loaded') && continuationToken && (
              <Button
                variant="link"
                variantColor="brandBlue"
                onClick={() => send('LOAD_MORE')}
              >
                {t('Load more')}
              </Button>
            )}
          </Stack>
        </Stack>
        <VotingSkeleton isLoaded={!current.matches('preload')}>
          <Stack spacing={8} align="flex-start" maxW={40}>
            <IconLink href="/oracles/new" icon="plus-solid" ml={-2}>
              {t('New voting')}
            </IconLink>
            <Stack>
              <Text fontWeight={500}>{t('Tags')}</Text>
              {!current.matches('preload') && (
                <Stack isInline wrap="wrap" spacing={2}>
                  {votingStatuses(filter).map(status => (
                    <VotingFilter
                      isChecked={statuses.includes(status)}
                      status={status}
                      cursor="pointer"
                      my={2}
                      onClick={() => {
                        send('TOGGLE_STATUS', {value: status})
                      }}
                    >
                      {status}
                    </VotingFilter>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </VotingSkeleton>
      </Stack>
      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default VotingListPage
