import * as React from 'react'
import {assign, createMachine} from 'xstate'
import {useMachine} from '@xstate/react'
import {log} from 'xstate/lib/actions'
import {eitherState, skipSSR} from '../../shared/utils/utils'
import {useAutoUpdateState} from '../../shared/providers/update-context'
import {requestDb} from '../../shared/utils/db'
import {isFork} from '../../shared/utils/node'

function createVotingStatusDb(version) {
  const db = global.sub(requestDb(), 'updates')
  const key = `hardForkVoting!!${version}`

  return {
    async get() {
      try {
        return await db.get(key)
      } catch (error) {
        if (error.notFound) return null
        throw error
      }
    },
    set(status) {
      return db.put(key, status)
    },
  }
}

const HardforkVotingStatus = {
  Approve: 'approve',
  Reject: 'reject',
  Unknown: 'unknown',
}

export function useFork() {
  const {nodeCurrentVersion, nodeRemoteVersion} = useAutoUpdateState()

  const statusDb = React.useMemo(
    () => skipSSR(() => createVotingStatusDb(nodeRemoteVersion)),
    [nodeRemoteVersion]
  )

  const [current, send] = useMachine(
    createMachine(
      {
        context: {
          changes: [],
          didActivate: undefined,
          startActivationDate: undefined,
          endActivationDate: undefined,
          votingOption: undefined,
          votingStatus: HardforkVotingStatus.Unknown,
          isReady: false,
        },
        initial: 'idle',
        states: {
          idle: {
            on: {FETCH: 'fetching'},
          },
          fetching: {
            invoke: {
              src: async (_, {version}) => {
                const fetchJsonResult = async (
                  path,
                  base = 'https://api.idena.io'
                ) =>
                  (await (await fetch(new URL(`api${path}`, base))).json())
                    .result

                const forkChangelog = await fetchJsonResult(
                  `/node/${version}/forkchangelog`
                )

                const [{upgrade: highestUpgrade}] = await fetchJsonResult(
                  '/upgrades?limit=1'
                )

                const nextTiming =
                  forkChangelog &&
                  (await fetchJsonResult(`/upgrade/${forkChangelog.Upgrade}`))

                return {
                  changes: forkChangelog?.Changes ?? [],
                  didActivate:
                    forkChangelog === null ||
                    highestUpgrade >= forkChangelog.Upgrade,
                  votingStatus: await statusDb.get(),
                  ...nextTiming,
                }
              },
              onDone: {
                target: 'fetched',
                actions: [
                  assign((context, {data}) => ({
                    ...context,
                    ...data,
                  })),
                  log(),
                ],
              },
              onError: 'failed',
            },
          },
          fetched: {
            entry: [assign({isReady: true})],
            on: {
              VOTE: {
                actions: [assign({votingOption: (_, {option}) => option})],
              },
              REJECT: {
                actions: [
                  assign({votingStatus: HardforkVotingStatus.Reject}),
                  'persist',
                ],
              },
              RESET: {
                actions: [assign({votingStatus: null}), 'persist'],
              },
            },
          },
          failed: {},
        },
      },
      {
        actions: {
          persist: ({votingStatus}) => statusDb.set(votingStatus),
        },
      }
    )
  )

  React.useEffect(() => {
    if (isFork(nodeCurrentVersion, nodeRemoteVersion))
      send('FETCH', {version: nodeRemoteVersion})
  }, [nodeCurrentVersion, nodeRemoteVersion, send])

  const {
    changes,
    startActivationDate,
    endActivationDate,
    didActivate,
    votingOption,
  } = current.context

  return [
    {
      details: {
        changes,
        startActivationDate,
        endActivationDate,
      },
      didActivate,
      votingOption,
      isWaiting:
        eitherState(current, 'fetched') &&
        current.context.votingStatus !== HardforkVotingStatus.Reject,
    },
    {
      vote: option => send('VOTE', {option}),
      reject: () => send('REJECT'),
      resetVoting: () => send('RESET_VOTING'),
    },
  ]
}
