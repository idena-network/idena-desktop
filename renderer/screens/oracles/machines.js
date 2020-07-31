import {Machine, assign} from 'xstate'
import {log} from 'xstate/lib/actions'
import {fetchVotings} from './utils'

export const votingListMachine = Machine(
  {
    context: {
      votings: [],
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: 'loadVotings',
          onDone: {
            target: 'loaded',
            actions: [
              assign({
                votings: ({votings}, {data}) => votings.concat(data),
              }),
              log(),
            ],
          },
        },
      },
      loaded: {},
    },
  },
  {
    services: {
      loadVotings: async () => fetchVotings(),
    },
  }
)
