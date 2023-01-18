import * as React from 'react'
import {assign, createMachine} from 'xstate'
import {useMachine} from '@xstate/react'
import {log} from 'xstate/lib/actions'
import {eitherState, skipSSR} from '../../shared/utils/utils'
import {useAutoUpdateState} from '../../shared/providers/update-context'
import {requestDb} from '../../shared/utils/db'
import {isFork} from '../../shared/utils/node'
import {apiUrl} from '../../shared/api/api-client'

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

export function useHardFork() {
  const {nodeCurrentVersion, nodeRemoteVersion} = useAutoUpdateState()

  const statusDb = React.useMemo(
    () => skipSSR(async () => createVotingStatusDb(nodeRemoteVersion)),
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
          votingStatus: HardforkVotingStatus.Unknown,
          isReady: false,
          isAvailable: false,
        },
        initial: 'idle',
        states: {
          idle: {
            on: {FETCH: 'fetching'},
          },
          fetching: {
            invoke: {
              src: async (_, {version}) => {
                const fetchJsonResult = async path =>
                  (await (await fetch(apiUrl(path))).json()).result

                const forkChangelog = await fetchJsonResult(
                  `node/${version}/forkchangelog`
                )

                const [{upgrade: highestUpgrade}] = await fetchJsonResult(
                  'upgrades?limit=1'
                )

                const nextTiming =
                  forkChangelog &&
                  (await fetchJsonResult(`upgrade/${forkChangelog.Upgrade}`))

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
              REJECT: {
                actions: [
                  assign({votingStatus: HardforkVotingStatus.Reject}),
                  'persist',
                ],
              },
              RESET: {
                actions: [
                  assign({votingStatus: HardforkVotingStatus.Unknown}),
                  'persist',
                ],
              },
            },
          },
          failed: {},
        },
      },
      {
        actions: {
          // eslint-disable-next-line no-shadow
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
    votingStatus,
  } = current.context

  return [
    {
      details: {
        changes,
        startActivationDate,
        endActivationDate,
      },
      votingStatus,
      isAvailable: eitherState(current, 'fetched'),
      didActivate,
      didReject: current.context.votingStatus === HardforkVotingStatus.Reject,
    },
    {
      reject: () => send('REJECT'),
      reset: () => send('RESET'),
    },
  ]
}
