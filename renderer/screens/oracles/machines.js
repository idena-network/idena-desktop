import {Machine, assign} from 'xstate'
import {log, raise} from 'xstate/lib/actions'
import {fetchVotings} from './utils'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'
import {epochDb} from '../../shared/utils/db'

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
      loadVotings: async ({epoch}) => {
        console.log(await epochDb('votings', epoch).all())
        return fetchVotings()
      },
    },
  }
)

export const newVotingMachine = Machine(
  {
    context: {
      epoch: {
        epoch: 1,
      },
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          CHANGE: {
            target: 'dirty',
            actions: [raise((_, e) => e)],
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
        initial: 'deployingContract',
        entry: ['onPublishing', log()],
        states: {
          deployingContract: {
            initial: 'estimating',
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
                  onError: {
                    actions: [log()],
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
      onPublishing: ({epoch, ...voting}) => {
        const db = epochDb('votings', epoch)
        db.put(voting)
      },
    },
    services: {
      estimateDeployContract: async ({epoch, ...voting}) => {
        const db = epochDb('votings', epoch)
        await db.put(voting)

        const {cid, startDate} = voting
        return callRpc('dna_estimateDeployContract', {
          codehash: '0x02',
          contractStake: 1000,
          args: [
            {index: 0, format: 'hex', value: cid},
            {index: 1, format: 'uint64', value: new Date(startDate).valueOf()},
          ],
        })
      },
      deployContract: async ({epoch, ...voting}) => {
        const db = epochDb('votings', epoch)
        await db.put(voting)

        const {cid, startDate} = voting
        return callRpc('dna_deployContract', {
          codehash: '0x02',
          contractStake: 1000,
          args: [
            {index: 0, format: 'hex', value: cid},
            {index: 1, format: 'uint64', value: new Date(startDate).valueOf()},
          ],
        })
      },
    },
  }
)
