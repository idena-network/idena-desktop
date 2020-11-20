import {Machine, assign, spawn} from 'xstate'
import {log, send, sendParent} from 'xstate/lib/actions'
import {
  fetchVotings,
  createContractCaller,
  buildContractDeploymentArgs,
  ContractRpcMode,
  isVotingStatus,
  isVotingMiningStatus,
  eitherStatus,
  createContractReadonlyCaller,
  createContractDataReader,
  buildDynamicArgs,
  contractMaxFee,
  setVotingStatus,
  votingFinishDate,
  fetchOracleRewardsEstimates,
  votingStatuses,
  fetchContractBalanceUpdates,
  fetchNetworkSize,
  stripOptions,
  hasValuableOptions,
  fetchVoting,
  mapVoting,
} from './utils'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'
import {epochDb, requestDb} from '../../shared/utils/db'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'
import {VotingListFilter} from './types'

export const votingListMachine = Machine(
  {
    context: {
      votings: [],
      filter: VotingListFilter.Todo,
      statuses: [],
      showAll: false,
    },
    on: {
      REFRESH: 'loading',
      ERROR: {
        actions: ['onError'],
      },
    },
    initial: 'preload',
    states: {
      preload: {
        invoke: {
          src: 'preload',
          onDone: {
            target: 'loading',
            actions: ['applyPreloadData', log()],
          },
          onError: {
            target: 'loading',
            actions: ['onError', log()],
          },
        },
      },
      loading: {
        invoke: {
          src: 'loadVotings',
          onDone: {
            target: 'loaded',
            actions: ['applyVotings', log()],
          },
          onError: {
            target: 'failure',
            actions: ['setError', log()],
          },
        },
        initial: 'normal',
        states: {
          normal: {
            after: {
              1000: 'late',
            },
          },
          late: {},
        },
      },
      loaded: {
        on: {
          FILTER: {target: 'loading', actions: ['setFilter', 'persistFilter']},
          TOGGLE_SHOW_ALL: {
            target: 'loading',
            actions: ['toggleShowAll', 'persistFilter'],
          },
          REVIEW_START_VOTING: {
            actions: [
              assign({
                startingVotingRef: ({votings}, {id}) =>
                  votings.find(({id: currId}) => currId === id)?.ref,
              }),
              log(),
            ],
          },
        },
        initial: 'idle',
        states: {
          idle: {
            on: {
              LOAD_MORE: 'loadingMore',
              TOGGLE_STATUS: {
                target: 'filtering',
                actions: ['applyStatuses', 'persistFilter', log()],
              },
            },
          },
          loadingMore: {
            invoke: {
              src: 'loadVotings',
              onDone: {
                target: 'idle',
                actions: ['applyMoreVotings', log()],
              },
              onError: {
                target: 'idle',
                actions: ['setError', log()],
              },
            },
          },
          filtering: {
            invoke: {
              src: 'loadVotings',
              onDone: {
                target: 'idle',
                actions: ['applyVotings', log()],
              },
              onError: {
                target: 'idle',
                actions: ['setError', log()],
              },
            },
          },
        },
      },
      failure: {
        on: {
          FILTER: {target: 'loading', actions: ['setFilter', 'persistFilter']},
          TOGGLE_STATUS: {
            target: 'loading',
            actions: ['applyStatuses', 'persistFilter', log()],
          },
        },
      },
    },
  },
  {
    actions: {
      applyVotings: assign({
        votings: ({epoch, address}, {data: {votings}}) =>
          votings.map(voting => ({
            ...voting,
            ref: spawn(
              // eslint-disable-next-line no-use-before-define
              votingMachine.withContext({...voting, epoch, address})
            ),
          })),
        continuationToken: (_, {data: {continuationToken}}) =>
          continuationToken,
      }),
      applyMoreVotings: assign({
        votings: ({votings, epoch, address}, {data: {votings: nextVotings}}) =>
          votings.concat(
            nextVotings.map(voting => ({
              ...voting,
              ref: spawn(
                // eslint-disable-next-line no-use-before-define
                votingMachine.withContext({
                  ...voting,
                  epoch,
                  address,
                })
              ),
            }))
          ),
        continuationToken: (_, {data: {continuationToken}}) =>
          continuationToken,
      }),
      applyPreloadData: assign((context, {data}) => ({
        ...context,
        ...data,
      })),
      setFilter: assign({
        filter: (_, {value}) => value,
        statuses: [],
        continuationToken: null,
      }),
      applyStatuses: assign({
        statuses: ({statuses}, {value}) =>
          statuses.includes(value)
            ? statuses.filter(s => s !== value)
            : statuses.concat(value),
        continuationToken: null,
      }),
      toggleShowAll: assign({
        showAll: (_, {value}) => value !== 'owned',
      }),
      persistFilter: ({filter, statuses, showAll}) => {
        global
          .sub(requestDb(), 'votings', {valueEncoding: 'json'})
          .put('filter', {filter, statuses, showAll})
      },
      setError: assign({
        errorMessage: (_, {data}) => data?.message,
      }),
    },
    services: {
      loadVotings: async ({
        epoch,
        address,
        filter,
        statuses,
        continuationToken,
      }) => {
        const {
          result,
          continuationToken: nextContinuationToken,
        } = await fetchVotings({
          all: [VotingListFilter.All, VotingListFilter.Own].some(
            s => s === filter
          ),
          own: filter === VotingListFilter.Own,
          oracle: address,
          'states[]': (statuses.length
            ? statuses
            : votingStatuses(filter)
          ).join(','),
          continuationToken,
        })

        const knownVotings = (result ?? []).map(mapVoting)

        await epochDb('votings', epoch).batchPut(knownVotings)

        return {
          votings: knownVotings,
          continuationToken: nextContinuationToken,
        }
      },
      preload: async () => {
        try {
          return JSON.parse(
            await global.sub(requestDb(), 'votings').get('filter')
          )
        } catch (error) {
          if (!error.notFound) throw new Error(error)
        }
      },
    },
  }
)

export const votingMachine = Machine(
  {
    id: 'voting',
    initial: 'unknown',
    states: {
      unknown: {
        on: {
          '': [
            {target: 'idle.resolveStatus', cond: 'isIdle'},
            {target: 'mining.resolveStatus', cond: 'isMining'},
            {
              target: VotingStatus.Invalid,
              cond: ({status}) => status === VotingStatus.Invalid,
            },
          ],
        },
      },
      idle: {
        initial: 'resolveStatus',
        states: {
          resolveStatus: {
            on: {
              '': [
                {
                  target: VotingStatus.Pending,
                  cond: 'isPending',
                },
                {
                  target: VotingStatus.Open,
                  cond: 'isRunning',
                },
                {
                  target: VotingStatus.Voted,
                  cond: 'isVoted',
                },
                {
                  target: VotingStatus.Counting,
                  cond: 'isCounting',
                },
                {
                  target: VotingStatus.Archived,
                  cond: 'isArchived',
                },
                {
                  target: `#voting.${VotingStatus.Invalid}`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          [VotingStatus.Pending]: {
            initial: 'idle',
            states: {
              idle: {
                on: {
                  REVIEW_START_VOTING: {
                    target: 'review',
                    actions: [
                      sendParent(({id}) => ({type: 'REVIEW_START_VOTING', id})),
                    ],
                  },
                },
              },
              review: {
                on: {
                  START_VOTING: {
                    target: `#voting.mining.${VotingStatus.Starting}`,
                    actions: ['setStarting', 'persist'],
                  },
                },
              },
            },
            on: {
              CANCEL: '.idle',
            },
          },
          [VotingStatus.Open]: {},
          [VotingStatus.Voted]: {},
          [VotingStatus.Counting]: {},
          [VotingStatus.Archived]: {},
          [VotingStatus.Terminated]: {},
          hist: {
            type: 'history',
          },
        },
        on: {
          ADD_FUND: {
            target: 'mining.funding',
            actions: ['setFunding', 'persist', log()],
          },
        },
      },
      mining: votingMiningStates('voting'),
      [VotingStatus.Invalid]: {
        on: {
          ADD_FUND: {
            target: 'mining.funding',
            actions: ['setFunding', 'persist', log()],
          },
        },
      },
    },
  },
  {
    actions: {
      setPending: setVotingStatus(VotingStatus.Pending),
      setFunding: assign({
        prevStatus: ({status}) => status,
        status: VotingStatus.Funding,
        balance: ({balance = 0}, {amount}) => balance + amount,
      }),
      setStarting: setVotingStatus(VotingStatus.Starting),
      setRunning: setVotingStatus(VotingStatus.Open),
      setInvalid: assign({
        status: VotingStatus.Invalid,
        errorMessage: (_, {error}) => error?.message,
      }),
      restorePrevStatus: assign({
        status: ({status, prevStatus}) => prevStatus || status,
      }),
      applyTx: assign({
        txHash: (_, {data}) => data,
      }),
      handleError: assign({
        errorMessage: (_, {error}) => error,
      }),
      onError: sendParent((_, {data}) => ({type: 'ERROR', data})),
      clearMiningStatus: assign({
        miningStatus: null,
      }),
      // eslint-disable-next-line no-shadow
      persist: ({epoch, ...context}) => {
        epochDb('votings', epoch).put(context)
      },
    },
    services: {
      ...votingServices(),
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
          } catch (error) {
            cb('TX_NULL', {error})
          }
        }

        timeoutId = setTimeout(fetchStatus, 10 * 1000)

        return () => {
          clearTimeout(timeoutId)
        }
      },
    },
    guards: {
      ...votingStatusGuards(),
    },
  }
)

export const createNewVotingMachine = (epoch, address) =>
  Machine(
    {
      context: {
        epoch,
        address,
        options: [{id: 0}, {id: 1}],
        votingDuration: 4320,
        publicVotingDuration: 180,
        quorum: 20,
        committeeSize: 100,
        shouldStartImmediately: true,
        dirtyBag: {},
      },
      initial: 'preload',
      states: {
        preload: {
          invoke: {
            src: ({committeeSize}) =>
              Promise.all([
                callRpc('bcn_feePerGas'),
                fetchOracleRewardsEstimates(committeeSize),
              ]),
            onDone: {
              target: 'editing',
              actions: [
                assign((context, {data: [feePerGas, estimates]}) => {
                  const minOracleReward = Number(
                    estimates.find(({type}) => type === 'min')?.amount
                  )
                  return {
                    ...context,
                    feePerGas,
                    minOracleReward,
                    oracleReward: minOracleReward,
                    oracleRewardsEstimates: estimates.map(({amount, type}) => ({
                      value: Number(amount),
                      label: type,
                    })),
                  }
                }),
                log(),
              ],
            },
          },
          initial: 'normal',
          states: {
            normal: {
              after: {
                1000: 'late',
              },
            },
            late: {},
          },
        },
        editing: {
          on: {
            CHANGE: {
              actions: ['setContractParams', 'setDirty', log()],
            },
            CHANGE_COMMITTEE: {
              target: '.updateCommittee',
              actions: ['setContractParams', 'setDirty', log()],
            },
            SET_DIRTY: {
              actions: 'setDirty',
            },
            SET_OPTIONS: {
              actions: [
                'setOptions',
                send({type: 'SET_DIRTY', id: 'options'}),
                log(),
              ],
            },
            ADD_OPTION: {
              actions: ['addOption'],
            },
            REMOVE_OPTION: {
              actions: ['removeOption'],
            },
            SET_WHOLE_NETWORK: [
              {
                target: '.fetchNetworkSize',
                actions: [assign({isWholeNetwork: true})],
                cond: (_, {checked}) => checked,
              },
              {
                actions: [assign({isWholeNetwork: false})],
              },
            ],
            PUBLISH: [
              {
                target: 'publishing',
                actions: [log()],
                cond: 'isValidForm',
              },
              {
                actions: [
                  'onInvalidForm',
                  send(
                    ({
                      options,
                      startDate,
                      shouldStartImmediately,
                      ...context
                    }) => ({
                      type: 'SET_DIRTY',
                      ids: [
                        hasValuableOptions(options) ? null : 'options',
                        shouldStartImmediately || startDate
                          ? null
                          : 'startDate',
                        ...['title', 'desc'].filter(f => !context[f]),
                      ].filter(v => v),
                    })
                  ),
                  log(),
                ],
              },
            ],
          },
          initial: 'idle',
          states: {
            idle: {},
            fetchNetworkSize: {
              invoke: {
                src: () => fetchNetworkSize(),
                onDone: {
                  target: 'updateCommittee',
                  actions: [
                    assign({
                      committeeSize: (_, {data}) => data,
                    }),
                  ],
                },
              },
            },
            updateCommittee: {
              invoke: {
                src: ({committeeSize}) =>
                  fetchOracleRewardsEstimates(committeeSize),
                onDone: {
                  target: 'idle',
                  actions: [
                    assign((context, {data}) => {
                      const minOracleReward = Number(
                        data.find(({type}) => type === 'min')?.amount
                      )
                      return {
                        ...context,
                        minOracleReward,
                        oracleReward: minOracleReward,
                        oracleRewardsEstimates: data.map(({amount, type}) => ({
                          value: Number(amount),
                          label: type,
                        })),
                      }
                    }),
                  ],
                },
              },
            },
          },
        },
        publishing: {
          initial: 'review',
          states: {
            review: {
              on: {
                CANCEL: {actions: send('EDIT')},
                CONFIRM: 'deploy',
              },
            },
            deploy: {
              initial: 'estimating',
              states: {
                estimating: {
                  invoke: {
                    src: 'estimateDeployContract',
                    onDone: {
                      target: 'deploying',
                      actions: [log()],
                    },
                    onError: {
                      actions: ['onError', send('PUBLISH_FAILED'), log()],
                    },
                  },
                },
                deploying: {
                  initial: 'submitting',
                  states: {
                    submitting: {
                      invoke: {
                        src: 'deployContract',
                        onDone: {
                          target: 'mining',
                          actions: ['applyDeployResult', log()],
                        },
                        onError: {
                          actions: ['onError', send('PUBLISH_FAILED'), log()],
                        },
                      },
                    },
                    mining: {
                      invoke: {
                        src: 'pollStatus',
                      },
                      on: {
                        MINED: [
                          {
                            actions: [
                              send((_, {from, balance}) => ({
                                type: 'START_VOTING',
                                from,
                                balance,
                              })),
                            ],
                            cond: 'shouldStartImmediately',
                          },
                          {
                            target: 'persist',
                            actions: ['setPending', log()],
                          },
                        ],
                      },
                    },
                    persist: {
                      invoke: {
                        src: 'persist',
                        onDone: {
                          actions: [send('DONE')],
                        },
                        onError: {
                          actions: ['onError', send('EDIT'), log()],
                        },
                      },
                    },
                  },
                },
              },
              on: {
                START_VOTING: VotingStatus.Starting,
              },
            },
            [VotingStatus.Starting]: {
              initial: 'submitting',
              states: {
                submitting: {
                  invoke: {
                    src: (context, {from, balance}) =>
                      votingServices().startVoting(context, {from, balance}),
                    onDone: {
                      target: 'mining',
                      actions: [
                        assign({
                          txHash: (_, {data}) => data,
                        }),
                        log(),
                      ],
                    },
                    onError: {
                      actions: ['onError', send('PUBLISH_FAILED'), log()],
                    },
                  },
                },
                mining: {
                  invoke: {
                    src: 'pollStatus',
                  },
                  on: {
                    MINED: {
                      target: 'persist',
                      actions: ['setRunning', log()],
                    },
                  },
                },
                persist: {
                  invoke: {
                    src: 'persist',
                    onDone: {
                      actions: [send('DONE')],
                    },
                    onError: {
                      actions: ['onError', send('EDIT'), log()],
                    },
                  },
                },
              },
            },
          },
          on: {
            DONE: 'done',
            EDIT: 'editing',
            PUBLISH_FAILED: 'editing',
          },
        },
        done: {
          entry: ['onDone', 'persist'],
        },
      },
    },
    {
      actions: {
        applyDeployResult: assign((context, {data: {txHash, voting}}) => ({
          ...context,
          txHash,
          ...voting,
        })),
        applyTx: assign({
          txHash: (_, {data: {txHash}}) => txHash,
        }),
        setContractParams: assign((context, {id, value}) => ({
          ...context,
          [id]: value,
        })),
        setOptions: assign({
          options: ({options}, {id, value}) => {
            const idx = options.findIndex(o => o.id === id)
            return [
              ...options.slice(0, idx),
              {...options[idx], value},
              ...options.slice(idx + 1),
            ]
          },
        }),
        addOption: assign({
          options: ({options}) =>
            options.concat({
              id: Math.max(...options.map(({id}) => id)) + 1,
            }),
        }),
        removeOption: assign({
          options: ({options}, {id}) => options.filter(o => o.id !== id),
        }),
        setDirty: assign({
          dirtyBag: ({dirtyBag}, {id, ids = []}) => ({
            ...dirtyBag,
            [id]: true,
            ...ids.reduce(
              (acc, curr) => ({
                ...acc,
                [curr]: true,
              }),
              {}
            ),
          }),
        }),
        setPending: setVotingStatus(VotingStatus.Pending),
        setRunning: setVotingStatus(VotingStatus.Open),
        // eslint-disable-next-line no-shadow
        persist: ({epoch, ...context}) => {
          epochDb('votings', epoch).put(context)
        },
      },
      services: {
        // eslint-disable-next-line no-shadow
        estimateDeployContract: async (voting, {from, balance, stake}) => {
          const {error, ...result} = await callRpc(
            'contract_estimateDeploy',
            buildContractDeploymentArgs(
              voting,
              {from, stake},
              ContractRpcMode.Estimate
            )
          )
          if (error) throw new Error(error)
          return {...result, from, balance, stake}
        },
        deployContract: async (
          // eslint-disable-next-line no-shadow
          {epoch, address, ...voting},
          {data: {contract, from, balance, stake, gasCost, txFee}}
        ) => {
          const txHash = await callRpc(
            'contract_deploy',
            buildContractDeploymentArgs(voting, {from, stake, gasCost, txFee})
          )

          const nextVoting = {
            ...voting,
            id: contract,
            options: stripOptions(voting.options),
            contractHash: contract,
            issuer: address,
            createDate: Date.now(),
            startDate: voting.shouldStartImmediately
              ? Date.now()
              : voting.startDate,
            finishDate: votingFinishDate(voting),
          }

          await epochDb('votings', epoch).put({
            ...nextVoting,
            txHash,
            status: VotingStatus.Deploying,
          })

          return {txHash, voting: nextVoting, from, balance}
        },
        pollStatus: ({txHash}, {data: {from, balance}}) => cb => {
          let timeoutId

          const fetchStatus = async () => {
            try {
              const result = await callRpc('bcn_transaction', txHash)
              if (result.blockHash !== HASH_IN_MEMPOOL) {
                cb({type: 'MINED', from, balance})
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
        persist: context => epochDb('votings', epoch).put(context),
      },
      guards: {
        shouldStartImmediately: ({shouldStartImmediately}) =>
          shouldStartImmediately,
        isValidForm: ({
          title,
          desc,
          options,
          startDate,
          shouldStartImmediately,
          committeeSize,
        }) =>
          title &&
          desc &&
          hasValuableOptions(options) &&
          (startDate || shouldStartImmediately) &&
          Number(committeeSize) > 0,
      },
    }
  )

export const createViewVotingMachine = (id, epoch, address) =>
  Machine(
    {
      id: 'viewVoting',
      context: {
        id,
        epoch,
        address,
        balanceUpdates: [],
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: 'loadVoting',
            onDone: {
              target: 'idle',
              actions: ['applyVoting', log()],
            },
            onError: {
              target: 'invalid',
              actions: [log()],
            },
          },
        },
        idle: {
          initial: 'resolveStatus',
          states: {
            resolveStatus: {
              on: {
                '': [
                  {
                    target: VotingStatus.Pending,
                    cond: 'isPending',
                  },
                  {
                    target: VotingStatus.Open,
                    cond: 'isRunning',
                  },
                  {
                    target: VotingStatus.Voted,
                    cond: 'isVoted',
                  },
                  {
                    target: VotingStatus.Counting,
                    cond: 'isCounting',
                  },
                  {
                    target: VotingStatus.Archived,
                    cond: 'isArchived',
                  },
                  {
                    target: VotingStatus.Terminated,
                    cond: 'isTerminated',
                  },
                  {
                    target: `#viewVoting.${VotingStatus.Invalid}`,
                    actions: ['setInvalid', 'persist'],
                  },
                ],
              },
            },
            [VotingStatus.Pending]: {
              initial: 'idle',
              states: {
                idle: {
                  on: {
                    REVIEW_START_VOTING: 'review',
                  },
                },
                review: {
                  on: {
                    START_VOTING: {
                      target: `#viewVoting.mining.${VotingStatus.Starting}`,
                      actions: ['setStarting', 'persist'],
                    },
                  },
                },
              },
              on: {
                CANCEL: '.idle',
              },
            },
            [VotingStatus.Open]: {},
            [VotingStatus.Voted]: {},
            [VotingStatus.Counting]: {
              initial: 'idle',
              states: {
                idle: {
                  on: {
                    FINISH: 'finish',
                    REVIEW_PROLONGATE_VOTING: 'prolongate',
                    TERMINATE: 'terminate',
                  },
                },
                finish: {
                  on: {
                    FINISH: {
                      target: `#viewVoting.mining.${VotingStatus.Finishing}`,
                      actions: ['setFinishing', 'persist'],
                    },
                  },
                },
                prolongate: {
                  on: {
                    PROLONGATE_VOTING: {
                      target: `#viewVoting.mining.${VotingStatus.Prolongating}`,
                      actions: ['setProlongating', 'persist'],
                    },
                  },
                },
                terminate: {
                  on: {
                    TERMINATE: {
                      target: `#viewVoting.mining.${VotingStatus.Terminating}`,
                      actions: ['setTerminating', 'persist'],
                    },
                  },
                },
              },
              on: {
                CANCEL: '.idle',
              },
            },
            [VotingStatus.Archived]: {
              initial: 'idle',
              states: {
                idle: {
                  on: {
                    TERMINATE: 'terminate',
                  },
                },
                terminate: {
                  on: {
                    TERMINATE: {
                      target: `#viewVoting.mining.${VotingStatus.Terminating}`,
                      actions: ['setTerminating', 'persist'],
                    },
                  },
                },
              },
              on: {
                CANCEL: '.idle',
              },
            },
            [VotingStatus.Terminated]: {},
            hist: {
              type: 'hist',
            },
          },
          on: {
            ADD_FUND: {
              target: `mining.${VotingStatus.Funding}`,
              actions: ['setFunding', 'persist', log()],
            },
            SELECT_OPTION: {
              actions: ['selectOption', log()],
            },
            REVIEW: 'review',
            REFRESH: 'loading',
          },
        },
        review: {
          on: {
            VOTE: {
              target: `mining.${VotingStatus.Voting}`,
              actions: ['setVoting', 'persist'],
            },
            CANCEL: 'idle',
          },
        },
        mining: votingMiningStates('viewVoting'),
        invalid: {},
      },
    },
    {
      actions: {
        applyVoting: assign((context, {data}) => ({
          ...context,
          ...data,
        })),
        setFunding: assign({
          prevStatus: ({status}) => status,
          status: VotingStatus.Funding,
          balance: ({balance = 0}, {amount}) =>
            Number(balance) + Number(amount),
        }),
        setStarting: setVotingStatus(VotingStatus.Starting),
        setRunning: setVotingStatus(VotingStatus.Open),
        setVoting: setVotingStatus(VotingStatus.Voting),
        setProlongating: setVotingStatus(VotingStatus.Prolongating),
        setFinishing: setVotingStatus(VotingStatus.Finishing),
        setTerminating: setVotingStatus(VotingStatus.Terminating),
        setTerminated: setVotingStatus(VotingStatus.Terminated),
        setVoted: setVotingStatus(VotingStatus.Voted),
        setArchived: assign({
          status: VotingStatus.Archived,
        }),
        setInvalid: assign({
          status: VotingStatus.Invalid,
          errorMessage: (_, {error}) => error?.message,
        }),
        restorePrevStatus: assign({
          status: ({prevStatus}) => prevStatus,
        }),
        applyTx: assign({
          txHash: (_, {data}) => data,
        }),
        handleError: assign({
          errorMessage: (_, {error}) => error,
        }),
        clearMiningStatus: assign({
          miningStatus: null,
        }),
        selectOption: assign({
          selectedOption: (_, {option}) => option,
        }),
        // eslint-disable-next-line no-shadow
        persist: ({epoch, address, ...context}) => {
          epochDb('votings', epoch).put(context)
        },
      },
      services: {
        // eslint-disable-next-line no-shadow
        loadVoting: async ({epoch, address, id}) => ({
          ...(await epochDb('votings', epoch).load(id)),
          ...mapVoting(await fetchVoting({id})),
          id,
          balanceUpdates: await fetchContractBalanceUpdates({
            address,
            contractAddress: id,
          }),
        }),
        ...votingServices(),
        vote: async (
          // eslint-disable-next-line no-shadow
          {contractHash, selectedOption, gasCost, txFee, epoch},
          {from}
        ) => {
          const readonlyCallContract = createContractReadonlyCaller({
            contractHash,
          })
          const readContractData = createContractDataReader({contractHash})

          const proof = await readonlyCallContract('proof', 'hex', {
            value: from,
          })

          const {error} = proof
          if (error) throw new Error(error)

          const salt = await callRpc(
            'dna_sign',
            `salt-${contractHash}-${epoch}`
          )

          const voteHash = await readonlyCallContract(
            'voteHash',
            'hex',
            {value: selectedOption, format: 'byte'},
            {value: salt}
          )

          const votingMinPayment = Number(
            await readContractData('votingMinPayment', 'dna')
          )

          const voteBlock = Number(
            await readonlyCallContract('voteBlock', 'uint64')
          )

          let callContract = createContractCaller({
            from,
            contractHash,
            amount: votingMinPayment,
            broadcastBlock: voteBlock,
            gasCost,
            txFee,
          })

          const {
            error: errorProof,
            gasCost: callGasCost,
            txFee: callTxFee,
          } = await callContract('sendVoteProof', ContractRpcMode.Estimate, {
            value: voteHash,
          })

          if (errorProof) throw new Error(errorProof)

          callContract = createContractCaller({
            from,
            contractHash,
            amount: votingMinPayment,
            broadcastBlock: voteBlock,
            gasCost: Number(callGasCost),
            txFee: Number(callTxFee),
          })

          const voteProofResp = await callContract(
            'sendVoteProof',
            ContractRpcMode.Call,
            {
              value: voteHash,
            }
          )

          await callContract(
            'sendVote',
            ContractRpcMode.Call,
            {value: selectedOption.toString(), format: 'byte'},
            {value: salt}
          )

          return voteProofResp
        },
        prolongateVoting: async ({contractHash}, {from}) => {
          let callContract = createContractCaller({
            from,
            contractHash,
          })

          const {error, gasCost, txFee} = await callContract(
            'prolongVoting',
            ContractRpcMode.Estimate
          )

          if (error) throw new Error(error)

          callContract = createContractCaller({
            from,
            contractHash,
            gasCost: Number(gasCost),
            txFee: Number(txFee),
          })

          return callContract('prolongVoting')
        },
        finishVoting: async (contract, {from}) => {
          let callContract = createContractCaller({...contract, from})

          const {error, gasCost, txFee} = await callContract(
            'finishVoting',
            ContractRpcMode.Estimate
          )
          if (error) throw new Error(error)

          callContract = createContractCaller({
            ...contract,
            from,
            gasCost: Number(gasCost),
            txFee: Number(txFee),
          })

          return callContract('finishVoting')
        },
        terminateContract: async (
          {
            // eslint-disable-next-line no-shadow
            address,
            issuer = address,
            contractHash,
          },
          {from}
        ) => {
          const payload = {
            from,
            contract: contractHash,
            args: buildDynamicArgs({value: issuer}),
          }

          const {error, gasCost, txFee} = await callRpc(
            'contract_estimateTerminate',
            payload
          )
          if (error) throw new Error(error)

          return callRpc('contract_terminate', {
            ...payload,
            maxFee: contractMaxFee(gasCost, txFee),
          })
        },
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
      guards: {
        // eslint-disable-next-line no-use-before-define
        ...votingStatusGuards(),
      },
    }
  )

function votingMiningStates(machineId) {
  return {
    initial: 'resolveStatus',
    states: {
      resolveStatus: {
        on: {
          '': [
            {
              target: VotingStatus.Deploying,
              cond: 'isDeploying',
            },
            {
              target: VotingStatus.Funding,
              cond: 'isFunding',
            },
            {
              target: VotingStatus.Starting,
              cond: 'isStarting',
            },
            {
              target: VotingStatus.Voting,
              cond: 'isVoting',
            },
            {
              target: VotingStatus.Finishing,
              cond: 'isFinishing',
            },
          ],
        },
      },
      [VotingStatus.Deploying]: {
        invoke: {
          src: 'pollStatus',
        },
        on: {
          MINED: {
            target: `#${machineId}.idle.${VotingStatus.Pending}`,
            actions: ['setPending', 'clearMiningStatus', 'persist', log()],
          },
        },
      },
      [VotingStatus.Funding]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'addFund',
              onDone: {
                target: 'mining',
                actions: ['applyTx'],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['handleError', 'onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.hist`,
                actions: [
                  'restorePrevStatus',
                  'clearMiningStatus',
                  'persist',
                  log(),
                ],
              },
            },
          },
        },
      },
      [VotingStatus.Starting]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'startVoting',
              onDone: {
                target: 'mining',
                actions: ['applyTx', log()],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['handleError', 'onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.${VotingStatus.Open}`,
                actions: ['setRunning', 'clearMiningStatus', 'persist', log()],
              },
            },
          },
        },
      },
      [VotingStatus.Voting]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'vote',
              onDone: {
                target: 'mining',
                actions: ['applyTx', log()],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.${VotingStatus.Voted}`,
                actions: ['setVoted', 'clearMiningStatus', 'persist', log()],
              },
            },
          },
        },
      },
      [VotingStatus.Prolongating]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'prolongateVoting',
              onDone: {
                target: 'mining',
                actions: ['applyTx', log()],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.${VotingStatus.Open}`,
                actions: ['setRunning', 'clearMiningStatus', 'persist', log()],
              },
            },
          },
        },
      },
      [VotingStatus.Finishing]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'finishVoting',
              onDone: {
                target: 'mining',
                actions: ['applyTx', log()],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.${VotingStatus.Archived}`,
                actions: ['setArchived', 'clearMiningStatus', 'persist', log()],
              },
            },
          },
        },
      },
      [VotingStatus.Terminating]: {
        initial: 'checkMiningStatus',
        states: {
          checkMiningStatus: {
            on: {
              '': [
                {
                  target: 'submitting',
                  cond: 'shouldSubmit',
                },
                {
                  target: 'mining',
                  cond: 'shouldPollStatus',
                },
                {
                  target: `#${machineId}.invalid`,
                  actions: ['setInvalid', 'persist'],
                },
              ],
            },
          },
          submitting: {
            invoke: {
              src: 'terminateContract',
              onDone: {
                target: 'mining',
                actions: ['applyTx', log()],
              },
              onError: {
                target: `#${machineId}.idle.hist`,
                actions: ['onError', 'restorePrevStatus', log()],
              },
            },
          },
          mining: {
            entry: [
              assign({
                miningStatus: 'mining',
              }),
              'persist',
            ],
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#${machineId}.idle.${VotingStatus.Terminated}`,
                actions: [
                  'setTerminated',
                  'clearMiningStatus',
                  'persist',
                  log(),
                ],
              },
            },
          },
        },
      },
    },
    on: {
      TX_NULL: {
        target: 'invalid',
        actions: ['setInvalid', 'clearMiningStatus', log()],
      },
    },
  }
}

function votingServices() {
  return {
    addFund: ({contractHash}, {amount, from}) =>
      callRpc('dna_sendTransaction', {
        to: contractHash,
        from,
        amount,
      }),
    startVoting: async (contract, {from, balance, amount = balance}) => {
      let callContract = createContractCaller({...contract, from, amount})

      const {error, gasCost, txFee} = await callContract(
        'startVoting',
        ContractRpcMode.Estimate
      )
      if (error) throw new Error(error)

      callContract = createContractCaller({
        ...contract,
        from,
        amount,
        gasCost: Number(gasCost),
        txFee: Number(txFee),
      })

      return callContract('startVoting')
    },
  }
}

function votingStatusGuards() {
  return {
    isIdle: eitherStatus(
      VotingStatus.Pending,
      VotingStatus.Open,
      VotingStatus.Voted,
      VotingStatus.Counting,
      VotingStatus.Archived
    ),
    isMining: ({status, txHash}) =>
      Boolean(txHash) &&
      eitherStatus(
        VotingStatus.Deploying,
        VotingStatus.Funding,
        VotingStatus.Starting,
        VotingStatus.Terminating
      )({status}),
    isDeploying: isVotingMiningStatus(VotingStatus.Deploying),
    isFunding: isVotingMiningStatus(VotingStatus.Funding),
    isStarting: isVotingMiningStatus(VotingStatus.Starting),
    isPending: isVotingStatus(VotingStatus.Pending),
    isRunning: isVotingStatus(VotingStatus.Open),
    isVoted: isVotingStatus(VotingStatus.Voted),
    isCounting: isVotingStatus(VotingStatus.Counting),
    isVoting: isVotingStatus(VotingStatus.Voting),
    isFinishing: isVotingStatus(VotingStatus.Finishing),
    isArchived: isVotingStatus(VotingStatus.Archived),
    isTerminated: isVotingStatus(VotingStatus.Terminated),
    shouldSubmit: ({miningStatus}) => !miningStatus,
    shouldPollStatus: ({miningStatus}) => miningStatus === 'mining',
  }
}
