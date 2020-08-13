import {Machine, assign} from 'xstate'
import {log} from 'xstate/lib/actions'
import {callRpc} from '../../shared/utils/utils'

const POLLING_INTERVAL = 1000 * 3

export const appMachine = Machine(
  {
    id: 'app',
    initial: 'idle',
    context: {
      prevBlock: -1,
      sync: null,
      epoch: null,
      identity: null,
      ceremonyIntervals: null,
    },
    on: {
      OFFLINE: 'offline',
      DISCONNECT: 'disconnected',
    },
    states: {
      idle: {
        on: {
          CONNECT: 'connecting',
        },
      },
      connecting: {
        invoke: {
          src: 'fetchSync',
          onDone: [
            {
              target: 'connected.syncing',
              cond: (_, {syncing}) => syncing,
            },
            {
              target: 'connected.synced',
            },
          ],
          onError: 'offline',
        },
        onExit: 'applySync',
      },
      connected: {
        initial: 'synced',
        states: {
          syncing: {
            invoke: {
              src: 'fetchIdentity',
              onDone: {
                actions: 'applyIdentity',
              },
            },
          },
          synced: {
            initial: 'pull',
            states: {
              pull: {
                invoke: {
                  src: 'fetchChainState',
                  onDone: {
                    target: 'ready',
                    actions: 'applyBlock',
                  },
                },
              },
              ready: {
                entry: [
                  // assign({
                  //   flipsRef: ({
                  //     epoch: {epoch},
                  //     identity: {flips, flipKeyWordPairs},
                  //   }) =>
                  //     spawn(
                  //       flipsMachine.withContext({
                  //         epoch,
                  //         knownFlips: flips || [],
                  //         availableKeywords: flipKeyWordPairs.filter(
                  //           ({used}) => !used
                  //         ),
                  //       })
                  //     ),
                  // }),
                ],
                invoke: {
                  src: 'pollSyncState',
                },
                on: {
                  BLOCK: {
                    target: 'ready',
                    actions: ['applyBlock', log()],
                  },
                  EPOCH: {
                    actions: [
                      ({epoch, flipsRef}) =>
                        flipsRef.send('EPOCH', {
                          epoch: epoch.epoch,
                          prevEpoch: 1,
                        }),
                    ],
                  },
                },
              },
            },
          },
        },
      },
      offline: {
        entry: log(),
        on: {
          RETRY: {
            target: 'connecting',
            actions: [log()],
          },
        },
      },
      disconnected: {
        on: {
          RECONNECT: 'connected',
        },
      },
    },
  },
  {
    services: {
      fetchSync: () => callRpc('bcn_syncing'),
      pollSyncState: ({prevBlock}) => cb => {
        let timeoutId

        const doFetch = async () => {
          try {
            const sync = await callRpc('bcn_syncing')
            if (sync.highestBlock > prevBlock) {
              cb({
                type: 'BLOCK',
                data: await Promise.all([
                  sync,
                  callRpc('dna_epoch'),
                  callRpc('dna_identity'),
                  callRpc('dna_ceremonyIntervals'),
                ]),
              })
            } else timeoutId = setTimeout(doFetch, POLLING_INTERVAL)
          } catch (err) {
            cb({type: 'OFFLINE', err})
          }
        }

        doFetch()

        return () => clearTimeout(timeoutId)
      },
      fetchChainState: ({sync}) =>
        Promise.all([
          sync,
          callRpc('dna_epoch'),
          callRpc('dna_identity'),
          callRpc('dna_ceremonyIntervals'),
        ]),
      fetchIdentity: () => callRpc('dna_identity'),
    },
    actions: {
      applySync: assign((context, {sync, data}) => ({
        ...context,
        sync: sync || data,
      })),
      applyBlock: assign(
        (context, {data: [sync, epoch, identity, ceremonyIntervals]}) => ({
          ...context,
          epoch,
          identity,
          ceremonyIntervals,
          prevBlock: sync.highestBlock,
        })
      ),
      applyIdentity: assign((context, {data}) => ({
        ...context,
        identity: data,
      })),
    },
    guards: {
      isSyncing: ({sync}) => sync && sync.syncing,
    },
  }
)
