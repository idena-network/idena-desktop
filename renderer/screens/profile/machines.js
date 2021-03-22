import {assign, createMachine} from 'xstate'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'
import {callRpc} from '../../shared/utils/utils'

export const activateMiningMachine = createMachine({
  id: 'mining',
  initial: 'idle',
  states: {
    idle: {
      on: {
        ACTIVATE: 'activating',
      },
    },
    activating: {
      initial: 'preview',
      states: {
        preview: {
          on: {
            ACTIVATE: 'submitting',
          },
        },
        submitting: {
          invoke: {
            src: ({isOnline}, {delegatee}) =>
              callRpc(
                isOnline ? 'dna_becomeOffline' : 'dna_becomeOnline',
                delegatee
              ),
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
