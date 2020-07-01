import {Machine, assign, spawn} from 'xstate'
import dayjs from 'dayjs'
import {log, sendParent, send} from 'xstate/lib/actions'
import nanoid from 'nanoid'
import {HASH_IN_MEMPOOL} from './hooks/use-tx'
import {callRpc} from './utils/utils'
import {InviteStatus} from './types'
import {epochDb} from './db'

export const createTimerMachine = duration =>
  Machine({
    initial: 'running',
    context: {
      elapsed: 0,
      duration,
      interval: 1,
    },
    states: {
      running: {
        entry: assign({
          start: dayjs(),
        }),
        invoke: {
          src: ({interval}) => cb => {
            const intervalId = setInterval(() => cb('TICK'), 1000 * interval)
            return () => clearInterval(intervalId)
          },
        },
        on: {
          '': {
            target: 'stopped',
            // eslint-disable-next-line no-shadow
            cond: ({elapsed, duration}) => elapsed >= duration,
          },
          TICK: {
            actions: assign({
              elapsed: ({start}) => dayjs().diff(start, 's'),
            }),
          },
        },
      },
      stopped: {
        on: {
          '': {
            target: 'running',
            // eslint-disable-next-line no-shadow
            cond: ({elapsed, duration}) => elapsed < duration,
          },
        },
      },
    },
    on: {
      DURATION_UPDATE: {
        actions: assign({
          // eslint-disable-next-line no-shadow
          duration: (_, {duration}) => duration,
        }),
      },
      RESET: {
        actions: assign({
          elapsed: 0,
        }),
      },
    },
  })

export const invitesMachine = Machine(
  {
    context: {
      epoch: null,
      invites: [],
    },
    initial: 'idle',
    states: {
      idle: {
        on: {
          '': [{target: 'loading', cond: ({epoch}) => Number.isInteger(epoch)}],
          EPOCH: {
            target: 'loading',
            actions: [
              assign({
                epoch: (_, {epoch}) => epoch,
              }),
            ],
          },
        },
      },
      loading: {
        invoke: {
          src: 'loadInvites',
          onDone: {
            target: 'ready',
            actions: [
              assign({
                invites: (_, {data}) => data,
              }),
              log(),
            ],
          },
          onError: {
            actions: log(),
          },
        },
      },
      ready: {
        on: {
          ISSUE_INVITE: {
            actions: [
              assign({
                invites: ({epoch, invites}, {invite}) =>
                  invites.concat({
                    ...invite,
                    status: InviteStatus.Issuing,
                    ref: spawn(
                      // eslint-disable-next-line no-use-before-define
                      inviteMachine.withContext({
                        epoch,
                        status: InviteStatus.Issuing,
                        ...invite,
                      })
                    ),
                  }),
              }),
            ],
          },
          INVITE_SUBMITTED: {actions: ['onInviteSubmitted']},
          SUBMIT_INVITE_FAILED: {actions: ['onSubmitInviteFailed']},
        },
      },
    },
  },
  {
    services: {
      loadInvites: ({epoch}) => epochDb(epoch).invites.toArray(),
    },
  }
)

export const inviteMachine = Machine(
  {
    initial: 'unknown',
    states: {
      unknown: {
        on: {
          '': [
            {
              target: 'issuing',
              cond: 'isIssuing',
            },
            {
              target: 'activating',
              cond: 'isActivating',
            },
            {target: 'idle'},
          ],
        },
      },
      idle: {
        on: {
          ISSUE: 'issuing',
        },
      },
      issuing: {
        initial: 'submitting',
        states: {
          submitting: {
            invoke: {
              src: 'submitInvite',
              onDone: {
                target: 'mining',
                actions: [
                  assign((invite, {data: {hash}}) => ({
                    ...invite,
                    id: nanoid(),
                    hash,
                  })),
                  sendParent(({hash}) => ({type: 'INVITE_SUBMITTED', hash})),
                  'persistInvite',
                  log(),
                ],
              },
              onError: {
                target: 'failure',
                actions: [
                  sendParent((_, {data: error}) => ({
                    type: 'SUBMIT_INVITE_FAILED',
                    error,
                  })),
                  log(),
                ],
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
                  assign({
                    status: InviteStatus.Issued,
                  }),
                  send('ISSUED'),
                  'persistInvite',
                ],
              },
            },
          },
          failure: {},
        },
        on: {
          ISSUED: 'issued',
          MISSING_TX: 'invalid',
        },
      },
      issued: {
        on: {
          ACTIVATE: 'activating',
        },
      },
      activating: {
        initial: 'submitting',
        states: {
          submitting: {
            invoke: {
              src: 'activateInvite',
            },
          },
          mining: {
            invoke: {
              src: 'pollStatus',
            },
          },
        },
        on: {
          MINED: 'idle',
          MISSING_TX: 'invalid',
        },
      },
      activated: {},
      invalid: {},
    },
  },
  {
    guards: {
      isIssuing: ({status}) => status === InviteStatus.Issuing,
      isActivating: ({status}) => status === InviteStatus.Activating,
    },
    services: {
      submitInvite: async ({address, amount}) =>
        callRpc('dna_sendInvite', {to: address, amount}),

      pollStatus: ({hash}) => cb => {
        let timeoutId

        const fetchTxStatus = async () => {
          const {result} = await callRpc('bcn_transaction', hash)
          if (result) {
            if (result.blockHash !== HASH_IN_MEMPOOL) cb('MINED')
            else {
              timeoutId = setTimeout(fetchTxStatus, 10 * 1000)
            }
          } else cb('MISSING_TX')
        }

        timeoutId = setTimeout(fetchTxStatus, 10 * 1000)

        return () => {
          clearTimeout(timeoutId)
        }
      },
    },
    actions: {
      persistInvite: ({epoch, ...invite}) => {
        epochDb(epoch).invites.put(invite)
      },
    },
  }
)
