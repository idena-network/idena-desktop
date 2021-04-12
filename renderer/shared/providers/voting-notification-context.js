import * as React from 'react'
import {useMachine} from '@xstate/react'
import {Machine} from 'xstate'
import {assign, log} from 'xstate/lib/actions'
import {useIdentityState} from './identity-context'
import {useEpochState} from './epoch-context'
import {fetchLastOpenVotings} from '../../screens/oracles/utils'
import {dbProxy} from '../utils/db'

const VotingNotificationStateContext = React.createContext()
const VotingNotificationDispatchContext = React.createContext()

export function VotingNotificationProvider(props) {
  const {address} = useIdentityState()
  const {epoch} = useEpochState() ?? {epoch: -1}

  const [current, send] = useMachine(
    Machine(
      {
        context: {
          todoCount: 0,
        },
        initial: 'waiting',
        states: {
          waiting: {
            on: {
              START: {
                target: 'ready',
                actions: ['setStartParams'],
              },
            },
          },
          ready: {
            initial: 'fetch',
            states: {
              fetch: {
                invoke: {
                  src: 'fetchUnreadCount',
                  onDone: {
                    target: 'idle',
                    actions: ['applyTodoCount', log()],
                  },
                },
              },
              idle: {
                after: {
                  10000: 'fetch',
                },
              },
            },
            on: {
              RESET: '.fetch',
            },
          },
        },
      },
      {
        services: {
          // eslint-disable-next-line no-shadow
          fetchUnreadCount: async ({address}) => {
            const lastVotings =
              (await fetchLastOpenVotings({oracle: address})) ?? []

            const lastVotingTimestamp = await (async () => {
              try {
                return await dbProxy.get('lastVotingTimestamp', 'votings')
              } catch (error) {
                if (error.notFound) {
                  return new Date(0)
                }
              }
            })()

            return lastVotings.filter(
              ({createTime}) =>
                new Date(createTime) > new Date(lastVotingTimestamp)
            )
          },
        },
        actions: {
          // eslint-disable-next-line no-shadow
          setStartParams: assign((context, {epoch, address}) => ({
            ...context,
            epoch,
            address,
          })),
          applyTodoCount: assign({
            todoCount: (_, {data}) => data.length,
          }),
        },
      }
    )
  )

  React.useEffect(() => {
    if (epoch && address) send('START', {epoch, address})
  }, [address, epoch, send])

  return (
    <VotingNotificationStateContext.Provider value={current.context}>
      <VotingNotificationDispatchContext.Provider
        value={{
          resetLastVotingTimestamp() {
            send('RESET')
          },
        }}
        {...props}
      />
    </VotingNotificationStateContext.Provider>
  )
}

export function useVotingNotificationState() {
  const context = React.useContext(VotingNotificationStateContext)
  if (context === undefined) {
    throw new Error(
      'useVotingNotificationState must be used within a VotingNotificationProvider'
    )
  }
  return context
}

export function useVotingNotificationDispatch() {
  const context = React.useContext(VotingNotificationDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useVotingNotificationDispatch must be used within a VotingNotificationDispatchContext'
    )
  }
  return context
}

export function useVotingNotification() {
  return [useVotingNotificationState(), useVotingNotificationDispatch()]
}
