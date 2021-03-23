import {assign, createMachine} from 'xstate'
import {log} from 'xstate/lib/actions'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'
import {NodeType} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'

export const activateMiningMachine = createMachine({
  id: 'mining',
  context: {
    mode: NodeType.Miner,
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        SHOW: 'showing',
      },
    },
    showing: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            CHANGE_MODE: {
              actions: [
                assign({
                  mode: (_, {mode}) => mode,
                }),
                log(),
              ],
            },
            ACTIVATE: 'activating',
            DEACTIVATE: 'deactivating',
          },
        },
        activating: {
          invoke: {
            src: ({mode}, {delegatee}) =>
              mode === NodeType.Delegator
                ? callRpc('dna_delegate', {to: delegatee})
                : callRpc('dna_becomeOnline'),
            onDone: {
              target: 'mining',
              actions: [
                assign({
                  hash: (_, {data}) => data,
                }),
              ],
            },
          },
        },
        deactivating: {
          invoke: {
            src: ({mode}) =>
              mode === NodeType.Delegator
                ? callRpc('dna_undelegate')
                : callRpc('dna_becomeOffline'),
            onDone: {
              target: 'mining',
              actions: [
                assign({
                  hash: (_, {data}) => data,
                }),
              ],
            },
          },
        },
        mining: {
          invoke: {
            src: ({hash}) => cb => {
              let timeoutId

              const fetchStatus = async () => {
                try {
                  const result = await callRpc('bcn_transaction', hash)
                  if (result.blockHash !== HASH_IN_MEMPOOL) {
                    cb({type: 'MINED'})
                  } else {
                    timeoutId = setTimeout(fetchStatus, 10 * 1000)
                  }
                } catch (error) {
                  cb('TX_NULL', {error: error?.message})
                }
              }

              timeoutId = setTimeout(fetchStatus, 10 * 1000)

              return () => {
                clearTimeout(timeoutId)
              }
            },
          },
          on: {
            MINED: {
              target: '#mining.idle',
              actions: [
                assign({
                  isOnline: true,
                }),
              ],
            },
          },
        },
      },
      on: {
        CANCEL: 'idle',
      },
    },
  },
})
