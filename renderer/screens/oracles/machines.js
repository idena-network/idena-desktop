import {Machine, assign, spawn} from 'xstate'
import {log, sendParent} from 'xstate/lib/actions'
import {
  fetchVotings,
  updateVotingList,
  callContract,
  createEstimateContractCaller,
  contractDeploymentParams,
  ContractRpcMode,
} from './utils'
import {VotingStatus} from '../../shared/types'
import {callRpc, mergeById} from '../../shared/utils/utils'
import {epochDb} from '../../shared/utils/db'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'

export const votingListMachine = Machine(
  {
    context: {
      votings: [],
      filteredVotings: [],
      filter: VotingStatus.All,
    },
    on: {
      REFRESH: 'loading',
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: 'loadVotings',
          onDone: {
            target: 'loaded',
            actions: ['applyLoadedVotings', log()],
          },
          onError: {
            target: 'loadingFailed',
            actions: [log()],
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
          MINED: {
            actions: [
              assign(({votings}, {id}) => {
                const nextVotings = updateVotingList(votings, {
                  id,
                  type: VotingStatus.Pending,
                })
                return {
                  votings: nextVotings,
                  filteredVotings: nextVotings,
                }
              }),
              log(),
            ],
          },
        },
      },
      loadingFailed: {},
    },
  },
  {
    actions: {
      applyLoadedVotings: assign({
        votings: ({votings, epoch}, {data: {persistedVotings, knownVotings}}) =>
          mergeById(votings, persistedVotings, knownVotings).map(voting => ({
            ...voting,
            ref: spawn(
              // eslint-disable-next-line no-use-before-define
              votingMachine.withContext({
                ...voting,
                epoch,
              }),
              `voting-${voting.id}`
            ),
          })),
      }),
    },
    services: {
      loadVotings: async ({epoch: {epoch}}) => ({
        persistedVotings: await epochDb('votings', epoch).all(),
        knownVotings: await fetchVotings(),
      }),
    },
  }
)

export const votingMachine = Machine(
  {
    context: {},
    initial: 'unknown',
    states: {
      unknown: {
        on: {
          '': [
            {
              target: 'deploying',
              cond: ({status, txHash}) =>
                status === VotingStatus.Mining && Boolean(txHash),
            },
            {
              target: 'counting',
              cond: ({status}) => status === VotingStatus.Counting,
            },
            {
              target: 'archived',
              cond: ({status}) => status === VotingStatus.Archived,
            },
            {target: 'idle'},
          ],
        },
      },
      idle: {
        on: {
          ADD_FUND: {
            target: 'funding',
            actions: [
              assign({
                fundingAmount: ({fundingAmount = 0}, {amount}) =>
                  fundingAmount + amount,
              }),
              log(),
            ],
          },
        },
      },
      deploying: {
        invoke: {
          src: 'pollStatus',
        },
        on: {
          MINED: {
            target: 'idle',
            actions: [
              assign({
                status: VotingStatus.Pending,
              }),
              sendParent(({id}) => ({
                type: 'MINED',
                id,
              })),
              'persist',
              log(),
            ],
          },
          TX_NULL: {
            target: 'invalid',
            actions: [
              assign({
                type: VotingStatus.Invalid,
              }),
              'persist',
              log(),
            ],
          },
        },
      },
      funding: {
        initial: 'submitting',
        states: {
          submitting: {
            invoke: {
              src: 'addFund',
              onDone: {
                target: 'mining',
                actions: [
                  assign((context, {data}) => ({
                    ...context,
                    txHash: data,
                    status: VotingStatus.Mining,
                  })),
                  'persist',
                  log(),
                ],
              },
              onError: {
                target: 'failure',
                actions: [
                  assign({
                    error: (_, {data: {message}}) => message,
                  }),
                  'persist',
                  log(),
                ],
              },
            },
          },
          mining: {
            invoke: {
              src: 'pollStatus',
            },
          },
          failure: {
            on: {
              PUBLISH: 'submitting',
            },
          },
        },
        on: {
          MINED: {
            target: 'idle',
            actions: [
              assign({
                status: VotingStatus.Pending,
              }),
              'persist',
              log(),
            ],
          },
          TX_NULL: {
            target: 'invalid',
            actions: [
              assign({
                error: 'Funding tx is missing',
                type: VotingStatus.Invalid,
              }),
              'persist',
            ],
          },
        },
      },
      [VotingStatus.Counting]: {},
      [VotingStatus.Archived]: {},
      invalid: {},
    },
  },
  {
    services: {
      pollStatus: ({txHash}) => cb => {
        let timeoutId

        const fetchStatus = async () => {
          try {
            const result = await callRpc('bcn_transaction', txHash)
            if (result.blockHash !== HASH_IN_MEMPOOL) {
              cb('MINED')
            } else {
              timeoutId = setTimeout(fetchStatus, 10 * 1000)
            }
          } catch {
            cb('TX_NULL')
          }
        }

        timeoutId = setTimeout(fetchStatus, 10 * 1000)

        return () => {
          clearTimeout(timeoutId)
        }
      },
      addFund: ({issuer, contractHash, fundingAmount}) =>
        callRpc('dna_sendTransaction', {
          to: contractHash,
          from: issuer,
          amount: fundingAmount,
        }),
    },
    actions: {
      persist: ({epoch: {epoch}, ...context}) => {
        epochDb('votings', epoch).put(context)
      },
    },
  }
)

export const createNewVotingMachine = epoch =>
  Machine(
    {
      context: {
        epoch: {
          epoch,
        },
        options: [],
      },
      initial: 'editing',
      states: {
        editing: {
          on: {
            CHANGE: {
              actions: ['setContractParams', log()],
            },
            SET_OPTIONS: {
              actions: ['setOptions', log()],
            },
            PUBLISH: {
              target: 'publishing',
              actions: [log()],
            },
          },
        },
        publishing: {
          initial: 'deployingContract',
          states: {
            deployingContract: {
              initial: 'estimating',
              states: {
                estimating: {
                  invoke: {
                    src: 'estimateDeployContract',
                    onDone: {
                      target: 'deploying',
                      actions: ['applyDeployResult', log()],
                    },
                  },
                },
                deploying: {
                  invoke: {
                    src: 'deployContract',
                    onDone: {
                      target: 'deployed',
                      actions: ['applyContractHash', log()],
                    },
                    onError: {
                      actions: [log()],
                    },
                  },
                },
                deployed: {
                  entry: ['onDeployed'],
                },
              },
            },
          },
        },
      },
    },
    {
      actions: {
        applyDeployResult: assign(
          (
            context,
            {data: {contract: contractHash, txHash, gasCost, txFee}}
          ) => ({
            ...context,
            contractHash,
            txHash,
            gasCost: Number(gasCost),
            txFee: Number(txFee),
          })
        ),
        applyContractHash: assign({
          txHash: (_, {data}) => data,
        }),
        setContractParams: assign((context, {id, value}) => ({
          ...context,
          [id]: value,
        })),
        setOptions: assign(({options, ...context}, {idx, value}) => ({
          ...context,
          options: [...options.slice(0, idx), value, ...options.slice(idx + 1)],
        })),
      },
      services: {
        estimateDeployContract: async ({identity, ...voting}) =>
          callRpc(
            'contract_estimateDeploy',
            contractDeploymentParams(voting, identity, ContractRpcMode.Estimate)
          ),
        // eslint-disable-next-line no-shadow
        deployContract: async ({epoch: {epoch}, identity, ...voting}) => {
          const deployResult = await callRpc(
            'contract_deploy',
            contractDeploymentParams(voting, identity)
          )

          await epochDb('votings', epoch).put({
            ...voting,
            txHash: deployResult,
            issuer: identity.from,
            status: VotingStatus.Mining,
          })

          return deployResult
        },
      },
    }
  )

export const createViewVotingMachine = (id, epoch) =>
  Machine(
    {
      context: {
        id,
        epoch,
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: 'loadVoting',
            onDone: {
              target: 'idle',
              actions: [
                assign((context, {data}) => ({
                  ...context,
                  ...data,
                })),
                log(),
              ],
            },
            onError: {target: 'invalid', actions: [log()]},
          },
        },
        idle: {
          on: {
            ADD_FUND: {
              target: 'funding',
              actions: [
                assign({
                  fundingAmount: ({fundingAmount = 0}, {amount}) =>
                    fundingAmount + amount,
                }),
                log(),
              ],
            },
            SELECT_OPTION: {
              actions: ['selectOption', log()],
            },
            VOTE_SELECTED: 'voting',
            VOTE: {
              target: 'voting',
              actions: ['selectOption'],
            },
            START_VOTING: 'startVoting',
          },
        },
        funding: {
          initial: 'submitting',
          states: {
            submitting: {
              invoke: {
                src: 'addFund',
                onDone: {
                  target: 'mining',
                  actions: [
                    assign((context, {data}) => ({
                      ...context,
                      txHash: data,
                      status: VotingStatus.Mining,
                    })),
                    'persist',
                    log(),
                  ],
                },
                onError: {
                  target: 'failure',
                  actions: [
                    assign({
                      error: (_, {data: {message}}) => message,
                    }),
                    'persist',
                    log(),
                  ],
                },
              },
            },
            mining: {
              invoke: {
                src: 'pollStatus',
              },
            },
            failure: {
              on: {
                PUBLISH: 'submitting',
              },
            },
          },
          on: {
            MINED: {
              target: 'idle',
              actions: [
                assign({
                  status: VotingStatus.Pending,
                }),
                'persist',
                log(),
              ],
            },
            TX_NULL: {
              target: 'invalid',
              actions: [
                assign({
                  error: 'Funding tx is missing',
                  type: VotingStatus.Invalid,
                }),
                'persist',
              ],
            },
          },
        },
        startVoting: {
          invoke: {
            src: async ({issuer, contractHash}) => {
              let result = await createEstimateContractCaller({
                issuer,
                contractHash,
              })('startVoting')

              result = await callContract({
                method: 'startVoting',
                from: issuer,
                contract: contractHash,
                amount: 100,
              })

              return result
            },
          },
          onDone: {
            actions: [log()],
          },
          onError: {
            actions: [log()],
          },
        },
        voting: {
          invoke: {
            src: 'vote',
            onDone: 'idle',
            onError: {target: 'invalid', actions: [log()]},
          },
        },
        invalid: {},
      },
    },
    {
      services: {
        pollStatus: ({txHash}) => cb => {
          let timeoutId

          const fetchStatus = async () => {
            try {
              const result = await callRpc('bcn_transaction', txHash)
              if (result.blockHash !== HASH_IN_MEMPOOL) {
                cb('MINED')
              } else {
                timeoutId = setTimeout(fetchStatus, 10 * 1000)
              }
            } catch {
              cb('TX_NULL')
            }
          }

          timeoutId = setTimeout(fetchStatus, 10 * 1000)

          return () => {
            clearTimeout(timeoutId)
          }
        },
        addFund: ({issuer, contractHash, fundingAmount}) =>
          callRpc('dna_sendTransaction', {
            to: contractHash,
            from: issuer,
            amount: fundingAmount,
          }),
        // eslint-disable-next-line no-shadow
        loadVoting: async ({epoch, id}) => epochDb('votings', epoch).load(id),
        vote: async ({issuer, contractHash, deposit = 100, selectedOption}) => {
          const resp = await callContract({
            from: issuer,
            contract: contractHash,
            method: 'sendVote',
            amount: deposit,
            args: [
              {
                index: 0,
                format: 'byte',
                value: selectedOption.toString(),
              },
              {
                index: 1,
                format: 'hex',
                value: '0x1',
              },
            ],
          })
          return resp
        },
      },
      actions: {
        // eslint-disable-next-line no-shadow
        persist: ({epoch, ...context}) => {
          epochDb('votings', epoch).put(context)
        },
        selectOption: assign({
          selectedOption: ({options}, {option}) =>
            options.findIndex(o => o === option),
        }),
      },
    }
  )
