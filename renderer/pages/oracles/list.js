import React from 'react'
import {Stack, Box, Text, Switch, FormLabel} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Page, PageTitle} from '../../screens/app/components'
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

function VotingListPage() {
  const {t} = useTranslation()

  const epoch = useEpochState()

  const [current, send] = useMachine(votingListMachine, {
    context: {epoch},
  })
  const {filteredVotings, filter} = current.context

  return (
    <Page>
      <PageTitle mb={10}>{t('Oracle votings')}</PageTitle>
      <Stack isInline spacing={20} w="full">
        <Stack spacing={6} w="md">
          {current.matches('loading') &&
            Array.from({length: 5}).map((_, idx) => (
              <VotingCardSkeleton key={idx} />
            ))}

          {current.matches('loaded') &&
            filteredVotings.map(({id, ref}) => (
              <VotingCard key={id} votingRef={ref} />
            ))}
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
            <VotingFilter value={VotingStatus.All} />
            <VotingFilter value={VotingStatus.Open} />
            <VotingFilter value={VotingStatus.Voted} />
            <VotingFilter value={VotingStatus.Counting} />
            <VotingFilter value={VotingStatus.Archived} />
          </VotingFilterList>
          <Box>
            <Text color="muted" mb={3}>
              {t('There are hidden votings not available for me')}
            </Text>
            <Stack isInline spacing={3} align="center">
              <Switch id="show-all"></Switch>
              <FormLabel htmlFor="show-all">{t('Show all')}</FormLabel>
            </Stack>
          </Box>
        </Stack>
      </Stack>
      <FloatDebug>{current.value}</FloatDebug>
    </Page>
  )
}

export default VotingListPage
