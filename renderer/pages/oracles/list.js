import React from 'react'
import {Stack, Text, Flex} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page, PageTitle} from '../../screens/app/components'
import {
  FlipFilter as FilterList,
  FlipFilterOption as FilterOption,
} from '../../screens/flips/components'
import {IconLink} from '../../shared/components/link'
import {VotingStatus} from '../../shared/types'
import {FloatDebug} from '../../shared/components/components'
import {votingListMachine} from '../../screens/oracles/machines'
import {
  VotingFilter,
  VotingFilterList,
  VotingCardSkeleton,
} from '../../screens/oracles/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {VotingCard} from '../../screens/oracles/containers'
import {useIdentityState} from '../../shared/providers/identity-context'

function VotingListPage() {
  const {t} = useTranslation()

  const identity = useIdentityState()
  const epoch = useEpochState()

  const [current, send] = useMachine(votingListMachine, {
    context: {epoch, identity},
  })
  const {votings, filter, showAll} = current.context

  return (
    <Page>
      <PageTitle mb={4}>{t('Oracle votings')}</PageTitle>
      <Stack isInline spacing={20} w="full">
        <Stack spacing={8}>
          <FilterList
            value={showAll ? 'all' : 'my'}
            mb={8}
            onChange={() => send('TOGGLE_SHOW_ALL')}
          >
            <FilterOption value="all">{t('All votings')}</FilterOption>
            <FilterOption value="my">{t('My votings')}</FilterOption>
          </FilterList>
          <Stack spacing={6} w="md">
            {current.matches('loading') &&
              Array.from({length: 5}).map((_, idx) => (
                <VotingCardSkeleton key={idx} />
              ))}

            {current.matches('failure') && (
              <Flex>Failish {current.context.error}</Flex>
            )}

            {current.matches('loaded') && votings.length === 0 && (
              <Flex>Emptyish</Flex>
            )}

            {current.matches('loaded') &&
              votings.map(({id, ref}) => (
                <VotingCard key={id} votingRef={ref} />
              ))}
          </Stack>
        </Stack>
        <Stack spacing={8} align="flex-start" maxW={40}>
          <IconLink
            href="/oracles/new"
            icon="plus-solid"
            px={0}
            _focus={null}
            _hover={null}
          >
            {t('New voting')}
          </IconLink>
          <VotingFilterList
            value={filter}
            onChange={e => send('FILTER', {filter: e.target.value})}
          >
            <Text fontWeight={500}>{t('Status')}</Text>
            <VotingFilter value={VotingStatus.Open} />
            <VotingFilter value={VotingStatus.Pending} />
            <VotingFilter value={VotingStatus.Voted} />
            <VotingFilter value={VotingStatus.Counting} />
            <VotingFilter value={VotingStatus.Archived} />
          </VotingFilterList>
        </Stack>
      </Stack>
      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default VotingListPage
