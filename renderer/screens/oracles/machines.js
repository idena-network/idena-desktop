import {Machine, assign} from 'xstate'
import {log} from 'xstate/lib/actions'
import {fetchVotings} from './utils'
import {VotingStatus} from '../../shared/types'

export const votingListMachine = Machine(
  {
    context: {
      votings: [],
      filteredVotings: [],
      filter: VotingStatus.All,
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: 'loadVotings',
          onDone: {
            target: 'loaded',
            actions: [
              assign((context, {data}) => ({
                ...context,
                votings: data,
                filteredVotings: data,
              })),
              log(),
            ],
          },
        },
      },
      loaded: {
        on: {
          FILTER: {
            actions: [
              assign({
                filteredVotings: ({votings}, {filter}) =>
                  votings.filter(
                    ({status}) =>
                      status === filter || filter === VotingStatus.All
                  ),
                filter: (_, {filter}) => filter,
              }),
              log(),
            ],
          },
        },
      },
    },
  },
  {
    services: {
      loadVotings: async () => fetchVotings(),
    },
  }
)

export const createVotingMachine = () =>
  Machine(
    {
      context: {},
      initial: 'idle',
      states: {
        idle: {
          on: {
            CHANGE: {
              target: 'dirty',
              actions: ['onChange', log()],
            },
          },
        },
        dirty: {
          on: {
            CHANGE: {
              actions: ['onChange', log()],
            },
          },
        },
      },
    },
    {
      actions: {
        onChange: assign((context, {name, value}) => ({
          ...context,
          [name]: value,
        })),
      },
    }
  )
