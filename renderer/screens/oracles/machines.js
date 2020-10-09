import {Machine, assign, spawn} from 'xstate'
import {log} from 'xstate/lib/actions'
import {
  fetchVotings,
  createContractCaller,
  buildContractDeploymentParams,
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
  byContractHash,
  hexToObject,
} from './utils'
import {VotingStatus} from '../../shared/types'
import {callRpc, merge} from '../../shared/utils/utils'
import {epochDb} from '../../shared/utils/db'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'

export const votingListMachine = Machine(
  {
    context: {
      votings: [],
      filter: VotingStatus.Open,
      showAll: false,
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
            actions: ['applyVotings', log()],
          },
          onError: {
            target: 'failure',
            actions: [log()],
          },
        },
      },
      loaded: {
        on: {
          FILTER: {
            target: 'loading',
            actions: ['setFilter'],
          },
          TOGGLE_SHOW_ALL: {
            target: 'loading',
            actions: ['toggleShowAll'],
          },
        },
      },
      failure: {},
    },
  },
  {
    actions: {
      applyVotings: assign({
        votings: ({epoch}, {data}) =>
          data.map(voting => ({
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
      setFilter: assign({
        filter: (_, {filter}) => filter,
      }),
      toggleShowAll: assign({
        showAll: ({showAll}) => !showAll,
      }),
    },
    services: {
      loadVotings: async ({
        epoch: {epoch},
        identity: {address},
        filter,
        showAll,
      }) => {
        const knownVotings = await fetchVotings({
          all: showAll.toString(),
          oracle: address,
          state: filter,
        })

        const enrichedKnownVotings = await Promise.all(
          knownVotings.map(async ({contractAddress, ...voting}) => {
            let votingMinPayment

            try {
              votingMinPayment = Number(
                await createContractDataReader({contractHash: contractAddress})(
                  'votingMinPayment',
                  'dna'
                )
              )
            } catch {
              votingMinPayment = 0
            }

            return {
              contractAddress,
              votingMinPayment,
              ...voting,
            }
          })
        )

        const normalizedKnownVotings = enrichedKnownVotings.map(
          ({contractAddress, fact, state, balance, ...voting}) => ({
            ...voting,
            status: state,
            fundingAmount: balance,
            contractHash: contractAddress,
            ...hexToObject(`0x${fact}`),
          })
        )

        const db = epochDb('votings', epoch)

        const persistedVotings = (await db.all()).filter(voting =>
          normalizedKnownVotings.some(byContractHash(voting))
        )

        const votings = merge(byContractHash)(
          persistedVotings,
          normalizedKnownVotings
        )

        await db.putMany(votings)

        return votings
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
            {target: 'idle.unknown', cond: 'isIdle'},
            {target: 'mining.unknown', cond: 'isMining'},
            {
              target: VotingStatus.Invalid,
              cond: ({status}) => status === VotingStatus.Invalid,
            },
          ],
        },
      },
      idle: {
        initial: 'unknown',
        states: {
          unknown: {
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
          hist: {
            type: 'history',
          },
        },
        on: {
          ADD_FUND: {
            target: 'mining.funding',
            actions: ['setFunding', 'addFunding', 'persist', log()],
          },
        },
      },
      mining: {
        initial: 'unknown',
        states: {
          unknown: {
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
              ],
            },
          },
          [VotingStatus.Deploying]: {
            invoke: {
              src: 'pollStatus',
            },
            on: {
              MINED: {
                target: `#voting.idle.${VotingStatus.Pending}`,
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
                      cond: ({miningStatus}) => !miningStatus,
                    },
                    {
                      target: 'mining',
                      cond: ({miningStatus}) => miningStatus === 'mining',
                    },
                    {
                      target: '#voting.invalid',
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
                    target: '#voting.idle.hist',
                    actions: ['handleError', 'restorePrevStatus', log()],
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
                    target: `#voting.idle.hist`,
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
                      cond: ({miningStatus}) => !miningStatus,
                    },
                    {
                      target: 'mining',
                      cond: ({miningStatus}) => miningStatus === 'mining',
                    },
                    {
                      target: '#voting.invalid',
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
                    target: '#voting.idle.hist',
                    actions: ['handleError', 'restorePrevStatus', log()],
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
                    target: `#voting.idle.${VotingStatus.Open}`,
                    actions: [
                      'setRunning',
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
      },
      [VotingStatus.Invalid]: {
        on: {
          ADD_FUND: {
            target: 'mining.funding',
            actions: ['setFunding', 'addFunding', 'persist', log()],
          },
        },
      },
    },
  },
  {
    actions: {
      setPending: setVotingStatus(VotingStatus.Pending),
      setFunding: setVotingStatus(VotingStatus.Funding),
      addFunding: assign({
        fundingAmount: ({fundingAmount = 0}, {amount}) =>
          fundingAmount + amount,
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
        errorMessage: (_, {data}) => data?.message,
      }),
      clearMiningStatus: assign({
        miningStatus: null,
      }),
      persist: ({epoch: {epoch}, ...context}) => {
        epochDb('votings', epoch).put(context)
      },
    },
    services: {
      addFund: ({issuer, contractHash, fundingAmount}) =>
        callRpc('dna_sendTransaction', {
          to: contractHash,
          from: issuer,
          amount: fundingAmount,
        }),
      startVoting: async contract => {
        const callContract = createContractCaller(contract)

        const {error} = await callContract(
          'startVoting',
          ContractRpcMode.Estimate
        )
        if (error) throw new Error(error)

        return callContract('startVoting')
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
      // eslint-disable-next-line no-use-before-define
      ...votingStatusGuards(),
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
        options: [0, 1],
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
            SET_OPTIONS_NUMBER: {
              actions: ['setOptionsNumber'],
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
                    onError: {
                      actions: ['onDeployFailed', log()],
                    },
                  },
                },
                deploying: {
                  invoke: {
                    src: 'deployContract',
                    onDone: {
                      target: 'done',
                      actions: ['applyContractHash', log()],
                    },
                    onError: {
                      actions: ['onDeployFailed', log()],
                    },
                  },
                },
                done: {
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
        setOptionsNumber: assign({
          maxOptions: (_, {value}) => value,
          options: ({options}, {value}) =>
            value > options.length
              ? options.concat(
                  Array.from({length: value - options.length}, () => null)
                )
              : options.slice(0, value),
        }),
      },
      services: {
        estimateDeployContract: async ({identity, ...voting}) => {
          const {error, ...result} = await callRpc(
            'contract_estimateDeploy',
            buildContractDeploymentParams(
              voting,
              identity,
              ContractRpcMode.Estimate
            )
          )
          if (error) throw new Error(error)
          return result
        },
        // eslint-disable-next-line no-shadow
        deployContract: async ({epoch: {epoch}, identity, ...voting}) => {
          const deployResult = await callRpc(
            'contract_deploy',
            buildContractDeploymentParams(voting, identity)
          )

          await epochDb('votings', epoch).put({
            ...voting,
            txHash: deployResult,
            issuer: identity.address,
            finishDate: votingFinishDate(voting),
            status: VotingStatus.Deploying,
          })

          return deployResult
        },
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
          initial: 'detecting',
          states: {
            detecting: {
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
                    target: `#viewVoting.${VotingStatus.Invalid}`,
                    actions: ['setInvalid', 'persist'],
                  },
                ],
              },
            },
            [VotingStatus.Pending]: {
              on: {
                START_VOTING: {
                  target: `#viewVoting.mining.voting`,
                  actions: ['setStarting', 'persist'],
                },
              },
            },
            [VotingStatus.Open]: {},
            [VotingStatus.Voted]: {},
            [VotingStatus.Counting]: {
              on: {
                FINISH_VOTING: `#viewVoting.mining.finishVoting`,
              },
            },
            hist: {
              type: 'hist',
            },
          },
          on: {
            SELECT_OPTION: {
              actions: ['selectOption', log()],
            },
            VOTE: 'mining.voting',
            ADD_FUND: `mining.${VotingStatus.Funding}`,
            START_VOTING: `mining.${VotingStatus.Starting}`,
            TERMINATE_CONTRACT: `mining.${VotingStatus.Terminating}`,
          },
        },
        mining: {
          states: {
            [VotingStatus.Funding]: {
              entry: ['setFunding', 'persist'],
              initial: 'submitting',
              states: {
                submitting: {
                  invoke: {
                    src: 'addFund',
                    onDone: {
                      target: 'mining',
                      actions: ['applyTx', log()],
                    },
                    onError: {
                      target: 'failure',
                      actions: ['onError', 'restorePrevStatus', log()],
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
                    RETRY: 'submitting',
                  },
                },
              },
            },
            [VotingStatus.Starting]: {
              entry: ['setStarting'],
              invoke: {
                src: 'startVoting',
                onDone: {
                  actions: ['applyTx', 'persist', log()],
                },
                onError: {
                  actions: ['onError', 'restorePrevStatus', log()],
                },
              },
            },
            voting: {
              invoke: {
                src: 'vote',
                onDone: {
                  target: `#viewVoting.idle.${VotingStatus.Voted}`,
                  actions: ['setVoted', 'applyTx', 'persist', log()],
                },
                onError: {
                  target: '#viewVoting.invalid',
                  actions: ['onError', log()],
                },
              },
            },
            finishVoting: {
              invoke: {
                src: 'finishVoting',
                onDone: {
                  actions: [
                    assign({
                      status: VotingStatus.Archived,
                    }),
                    'applyTx',
                    'persist',
                    log(),
                  ],
                },
                onError: {
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
                  actions: ['onError', log()],
                },
              },
            },
          },
        },
        invalid: {},
      },
      on: {
        MINED: {
          target: 'idle.hist',
          actions: ['restorePrevStatus', 'persist', log()],
        },
        TX_NULL: {
          target: 'invalid',
          actions: ['handleError'],
        },
      },
    },
    {
      actions: {
        setFunding: assign({
          prevStatus: ({status}) => status,
          status: VotingStatus.Funding,
          fundingAmount: ({fundingAmount = 0}, {amount}) =>
            fundingAmount + amount,
        }),
        setStarting: assign({
          prevStatus: ({status}) => status,
          status: VotingStatus.Starting,
        }),
        applyVoting: assign((context, {data}) => ({
          ...context,
          ...data,
        })),
        setVoted: assign({
          status: VotingStatus.Voted,
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
        // eslint-disable-next-line no-shadow
        persist: ({epoch, ...context}) => {
          epochDb('votings', epoch).put(context)
        },
      },
      services: {
        // eslint-disable-next-line no-shadow
        loadVoting: async ({epoch, id}) => epochDb('votings', epoch).load(id),
        addFund: ({issuer, contractHash, fundingAmount}) =>
          callRpc('dna_sendTransaction', {
            to: contractHash,
            from: issuer,
            amount: fundingAmount,
          }),
        startVoting: async contract => {
          const callContract = createContractCaller(contract)

          const {error} = await callContract(
            'startVoting',
            ContractRpcMode.Estimate
          )
          if (error) throw new Error(error)

          return callContract('startVoting')
        },
        vote: async ({
          // eslint-disable-next-line no-shadow
          address,
          issuer,
          contractHash,
          amount,
          selectedOption,
          gasCost,
          txFee,
        }) => {
          const readonlyCallContract = createContractReadonlyCaller({
            contractHash,
          })
          const readContractData = createContractDataReader({contractHash})

          const proof = await readonlyCallContract('proof', 'hex', {
            value: address,
          })

          const {error} = proof

          if (error) throw new Error(error)

          const voteHash = await readonlyCallContract(
            'voteHash',
            'hex',
            {value: selectedOption.toString(), format: 'byte'},
            {value: issuer}
          )

          const votingMinPayment = Number(
            await readContractData('votingMinPayment', 'dna')
          )

          const voteBlock = Number(
            await readonlyCallContract('voteBlock', 'uint64')
          )

          let callContract = createContractCaller({
            issuer,
            contractHash,
            amount: votingMinPayment || amount,
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
            issuer,
            contractHash,
            amount: votingMinPayment || amount,
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
            {value: issuer}
          )

          return voteProofResp
        },
        finishVoting: async contract => {
          let callContract = createContractCaller(contract)

          const {error, gasCost, txFee} = await callContract(
            'terminate',
            ContractRpcMode.Estimate
          )
          if (error) throw new Error(error)

          callContract = createContractCaller({
            ...contract,
            gasCost: Number(gasCost),
            txFee: Number(txFee),
          })

          return callContract('terminate')
        },
        terminateContract: async ({
          // eslint-disable-next-line no-shadow
          address,
          issuer = address,
          contractHash,
          gasCost,
          txFee,
        }) => {
          const payload = {
            from: issuer,
            contract: contractHash,
            args: buildDynamicArgs({value: issuer}),
          }

          const {error} = await callRpc('contract_estimateTerminate', payload)
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
  }
}
