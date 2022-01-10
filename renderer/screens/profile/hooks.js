import {useMachine} from '@xstate/react'
import {assign, createMachine} from 'xstate'

export function useIdenaBot() {
  const [current, send] = useMachine(
    createMachine({
      context: {
        connected: undefined,
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: 'loadConnectionStatus',
          },
          on: {
            CONNECTED: 'connected',
            DISCONNECTED: 'disconnected',
          },
        },
        connected: {
          entry: [assign({connected: true}), 'persist'],
        },
        disconnected: {
          on: {CONNECT: 'connected'},
        },
      },
    }),
    {
      services: {
        loadConnectionStatus: () => cb => {
          try {
            cb(
              JSON.parse(localStorage.getItem('connectIdenaBot'))
                ? 'CONNECTED'
                : 'DISCONNECTED'
            )
          } catch (e) {
            console.error(e)
            cb('DISCONNECTED')
          }
        },
      },
      actions: {
        persist: ({connected}) => {
          localStorage.setItem('connectIdenaBot', connected)
        },
      },
    }
  )

  return [current.context.connected, () => send('CONNECT')]
}
