import {Machine, assign, spawn} from 'xstate'
import {choose, log, send, sendParent} from 'xstate/lib/actions'
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
  hexToObject,
  fetchOracleRewardsEstimates,
  minOracleReward,
  votingStatuses,
  fetchContractBalanceUpdates,
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
          src: 'loadFilter',
          onDone: {
            target: 'loading',
            actions: ['applyFilter', log()],
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
            // eslint-disable-next-line no-use-before-define
            ref: spawn(votingMachine.withContext({...voting, epoch, address})),
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
                votingMachine.withContext({...voting, epoch, address})
              ),
            }))
          ),
        continuationToken: (_, {data: {continuationToken}}) =>
          continuationToken,
      }),
      applyFilter: assign((context, {data}) => ({
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
          all: filter !== VotingListFilter.Own,
          oracle: address,
          'states[]': (statuses.length
            ? statuses
            : votingStatuses(filter)
          ).join(','),
          continuationToken,
        })

        const knownVotings = (result ?? []).map(
          ({
            contractAddress,
            author,
            fact,
            state,
            startTime,
            minPayment,
            ...voting
          }) => ({
            ...voting,
            id: contractAddress,
            contractHash: contractAddress,
            issuer: author,
            status: state,
            startDate: startTime,
            votingMinPayment: minPayment,
            ...hexToObject(fact),
          })
        )

        await epochDb('votings', epoch).batchPut(knownVotings)

        // const miningVotings = persistedVotings.filter(
        //   ({status, prevStatus, issuer}) =>
        //     areSameCaseInsensitive(issuer, address) &&
        //     ((areSameCaseInsensitive(status, VotingStatus.Deploying) &&
        //       areSameCaseInsensitive(filter, VotingStatus.Pending)) ||
        //       (areSameCaseInsensitive(status, VotingStatus.Starting) &&
        //         areSameCaseInsensitive(filter, VotingStatus.Open)) ||
        //       (areSameCaseInsensitive(status, VotingStatus.Voting) &&
        //         areSameCaseInsensitive(filter, VotingStatus.Voted)) ||
        //       (areSameCaseInsensitive(status, VotingStatus.Finishing) &&
        //         areSameCaseInsensitive(filter, VotingStatus.Archived)) ||
        //       (areSameCaseInsensitive(status, VotingStatus.Funding) &&
        //         areSameCaseInsensitive(filter, prevStatus)))
        // )

        return {
          votings: knownVotings,
          continuationToken: nextContinuationToken,
        }
      },
      loadFilter: async () => {
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
            on: {
              START_VOTING: {
                target: `#voting.mining.${VotingStatus.Starting}`,
                actions: ['setStarting', 'persist'],
              },
            },
          },
          [VotingStatus.Open]: {},
          [VotingStatus.Voted]: {},
          [VotingStatus.Counting]: {},
          [VotingStatus.Archived]: {},
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
      persist: ({epoch, identity, ...context}) => {
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
        publicVotingDuration: 4320,
        oracleReward: undefined,
        quorum: 20,
        committeeSize: 100,
      },
      initial: 'preload',
      states: {
        preload: {
          invoke: {
            src: () =>
              Promise.all([
                callRpc('bcn_feePerGas'),
                fetchOracleRewardsEstimates(),
              ]),
            onDone: {
              target: 'editing',
              actions: [
                assign({
                  feePerGas: (_, {data: [fee]}) => fee,
                  oracleReward: (_, {data: [fee]}) => minOracleReward(fee),
                  oracleRewardsEstimates: (_, {data: [, estimates]}) =>
                    estimates.map(({amount, type}) => ({
                      value: Number(amount),
                      label: type,
                    })),
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
              actions: ['setContractParams', log()],
            },
            SET_OPTIONS: {
              actions: ['setOptions', log()],
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
            PUBLISH: {
              target: 'publishing',
              actions: [log()],
            },
          },
          initial: 'idle',
          states: {
            idle: {},
            fetchNetworkSize: {
              invoke: {
                src: async () =>
                  (
                    await fetch(
                      'https://api.idena.io/api/onlineidentities/count'
                    )
                  ).json(),
                onDone: {
                  target: 'idle',
                  actions: [
                    assign({
                      committeeSize: (_, {data: {result}}) => result,
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
                        MINED: {
                          actions: [
                            choose([
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
                                actions: [send('DONE')],
                              },
                            ]),
                            log(),
                          ],
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
              initial: 'submittingAddFund',
              states: {
                submittingAddFund: {
                  invoke: {
                    src: async ({contractHash}, {from, balance}) => ({
                      txHash: await callRpc('dna_sendTransaction', {
                        to: contractHash,
                        from,
                        amount: balance,
                      }),
                      from,
                      balance,
                    }),
                    onDone: {
                      target: 'miningFund',
                      actions: ['applyTx', log()],
                    },
                    onError: {
                      actions: ['onError', send('PUBLISH_FAILED'), log()],
                    },
                  },
                },
                miningFund: {
                  invoke: {
                    src: 'pollStatus',
                  },
                  on: {
                    MINED: {
                      target: 'submitting',
                      actions: [log()],
                    },
                  },
                },
                submitting: {
                  invoke: {
                    src: (context, {from}) =>
                      votingServices().startVoting(context, {from}),
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
                      actions: ['setRunning', 'persist', send('DONE'), log()],
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
          entry: ['onDone'],
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
            contractHash: contract,
            issuer: address,
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
      },
      guards: {
        shouldStartImmediately: ({shouldStartImmediately}) =>
          shouldStartImmediately,
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
                    target: `#viewVoting.${VotingStatus.Invalid}`,
                    actions: ['setInvalid', 'persist'],
                  },
                ],
              },
            },
            [VotingStatus.Pending]: {
              on: {
                START_VOTING: {
                  target: `#viewVoting.mining.${VotingStatus.Starting}`,
                  actions: ['setStarting', 'persist'],
                },
              },
            },
            [VotingStatus.Open]: {},
            [VotingStatus.Voted]: {},
            [VotingStatus.Counting]: {
              on: {
                FINISH_VOTING: {
                  target: `#viewVoting.mining.${VotingStatus.Finishing}`,
                  actions: ['setFinishing', 'persist'],
                },
              },
            },
            [VotingStatus.Archived]: {},
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
            PROLONGATE_VOTING: {
              target: `mining.${VotingStatus.Prolongating}`,
              actions: ['setProlongating', 'persist'],
            },
            TERMINATE_CONTRACT: `mining.${VotingStatus.Terminating}`,
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
        applyVoting: assign((context, {data}) => ({
          ...context,
          ...data,
        })),
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
          balanceUpdates: await fetchContractBalanceUpdates({
            address,
            contractAddress: id,
          }),
        }),
        ...votingServices(),
        vote: async (
          {contractHash, selectedOption, gasCost, txFee},
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

          const voteHash = await readonlyCallContract(
            'voteHash',
            'hex',
            {value: selectedOption, format: 'byte'},
            {value: from}
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
            {value: from}
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
        invoke: {
          src: 'prolongateVoting',
          onDone: {
            target: `#${machineId}.idle.${VotingStatus.Open}`,
            actions: ['setRunning', 'applyTx', 'persist', log()],
          },
          onError: {
            target: `#${machineId}.idle.hist`,
            actions: ['onError', 'restorePrevStatus', log()],
          },
        },
      },
      [VotingStatus.Finishing]: {
        invoke: {
          src: 'finishVoting',
          onDone: {
            target: `#${machineId}.idle.${VotingStatus.Archived}`,
            actions: ['setArchived', 'applyTx', 'persist', log()],
          },
          onError: {
            target: `#${machineId}.idle.hist`,
            actions: ['onError', 'restorePrevStatus', log()],
          },
        },
      },
      [VotingStatus.Terminating]: {
        invoke: {
          src: 'terminateContract',
          onDone: {
            actions: [log()],
          },
          onError: {
            actions: ['onError', 'restorePrevStatus', log()],
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
    shouldSubmit: ({miningStatus}) => !miningStatus,
    shouldPollStatus: ({miningStatus}) => miningStatus === 'mining',
  }
}
