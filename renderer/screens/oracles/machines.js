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
