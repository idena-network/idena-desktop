import {Machine, assign} from 'xstate'
import {log} from 'xstate/lib/actions'
import {fetchVotings} from './utils'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'

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

export const newVotingMachine = Machine(
  {
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
          PUBLISH: {
            target: 'publishing',
            actions: [log()],
          },
        },
      },
      publishing: {
        initial: 'creatingVotingContent',
        states: {
          creatingVotingContent: {
            invoke: {
              src: 'createVotingContent',
              onDone: {
                target: 'deployingContract',
                actions: [
                  assign({
                    cid: (_, cid) => cid,
                  }),
                ],
              },
            },
          },
          deployingContract: {
            states: {
              estimating: {
                invoke: {
                  src: 'estimateDeployContract',
                  onDone: {
                    target: 'deploying',
                    actions: [
                      assign((context, {contract: contractHash, txHash}) => ({
                        ...context,
                        contractHash,
                        txHash,
                      })),
                    ],
                  },
                },
              },
              deploying: {
                invoke: {
                  src: 'deployContract',
                  onDone: {
                    target: 'deploying',
                    actions: [
                      assign((context, {contract: contractHash, txHash}) => ({
                        ...context,
                        contractHash,
                        txHash,
                      })),
                    ],
                  },
                },
              },
            },
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
    services: {
      createVotingContent: ({title, desc}) =>
        callRpc('ipfs_add', {title, desc}),
      estimateDeployContract: ({cid, startDate}) =>
        callRpc('dna_estimateDeployContract', {
          codehash: '0x02',
          contractStake: 1000,
          args: [
            {index: 0, format: 'hex', value: cid},
            {index: 1, format: 'uint64', value: new Date(startDate).valueOf()},
          ],
        }),
      deployContract: ({cid, startDate}) =>
        callRpc('dna_deployContract', {
          codehash: '0x02',
          contractStake: 1000,
          args: [
            {index: 0, format: 'hex', value: cid},
            {index: 1, format: 'uint64', value: new Date(startDate).valueOf()},
          ],
        }),
    },
  }
)
