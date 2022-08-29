import React from 'react'
import {useToast} from '@chakra-ui/react'
import {useTranslation} from 'react-i18next'
import {useMachine} from '@xstate/react'
import {Toast, Page, PageTitle} from '../../shared/components/components'
import {votingListMachine} from '../../screens/oracles/machines'
import {useEpochState} from '../../shared/providers/epoch-context'
import {useIdentityState} from '../../shared/providers/identity-context'
import {humanError} from '../../screens/oracles/utils'
import Layout from '../../shared/components/layout'
import {useChainState} from '../../shared/providers/chain-context'
import {useVotingNotification} from '../../shared/providers/voting-notification-context'

function VotingListPage() {
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
      </Page>
    </Layout>
  )
}

export default VotingListPage
