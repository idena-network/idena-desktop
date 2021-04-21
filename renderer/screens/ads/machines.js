/* eslint-disable no-use-before-define */
import {Machine, assign, spawn} from 'xstate'
import {log} from 'xstate/lib/actions'
import {AdStatus} from '../../shared/types'
import {wait} from '../../shared/utils/fn'
import {byId} from '../../shared/utils/utils'

export const adListMachine = Machine({
  id: 'adList',
  context: {
    selectedAd: {},
    ads: [],
  },
  initial: 'init',
  states: {
    init: {
      invoke: {
        src: 'init',
        onDone: {
          target: 'ready',
          actions: [
            assign({
              ads: (_, {data}) =>
                data.map(ad => ({
                  ...ad,
                  ref: spawn(adMachine.withContext(ad)),
                })),
            }),
            log(),
          ],
        },
        onError: 'fail',
      },
    },
    ready: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            REVIEW: {
              target: 'sendingToReview',
              actions: [
                assign({
                  selectedAd: ({ads}, ad) => ads.find(byId(ad)),
                }),
              ],
            },
          },
        },
        sendingToReview: {
          on: {
            CANCEL: 'idle',
          },
          initial: 'preview',
          states: {
            preview: {
              entry: [log()],
              on: {
                SUBMIT: 'submitting',
              },
            },
            submitting: {
              entry: [log()],
              invoke: {
                src: () => wait(100),
                onDone: 'mining',
              },
            },
            mining: {
              invoke: {
                src: () => cb => {
                  wait(3000).then(() => {
                    cb('MINED')
                  })
                },
              },
              on: {
                MINED: {
                  target: '#adList.ready.idle',
                  actions: [
                    assign({
                      ads: ({ads, selectedAd}) =>
                        ads.map(ad =>
                          ad.id === selectedAd.id
                            ? {
                                status: AdStatus.Reviewing,
                                ...ad,
                              }
                            : ad
                        ),
                      selectedAd: ({selectedAd}) => ({
                        ...selectedAd,
                        status: AdStatus.Reviewing,
                      }),
                    }),
                    'onSentToReview',
                  ],
                },
              },
            },
          },
        },
      },
    },
    fail: {},
  },
  on: {
    SELECT: {
      actions: [
        assign({
          selectedAd: ({ads}, {id}) => ads.find(a => a.id === id),
        }),
      ],
    },
  },
})

export const adMachine = Machine({
  id: 'ads',
  context: {
    title: '',
    cover: '',
    url: '',
    location: '',
    lang: '',
    age: 0,
    os: '',
  },
  initial: 'editing',
  states: {
    editing: {
      on: {
        CHANGE: {
          actions: [
            assign((ctx, {ad}) => ({
              ...ctx,
              ...ad,
            })),
          ],
        },
      },
    },
    publishing: {},
    idle: {},
  },
})

export const editAdMachine = Machine({
  id: 'editAd',
  initial: 'init',
  states: {
    init: {
      invoke: {
        src: 'init',
        onDone: {
          target: 'editing',
          actions: [assign((ctx, {data}) => ({...ctx, ...data})), log()],
        },
        onFail: {
          actions: [log()],
        },
      },
    },
    editing: {
      on: {
        UPDATE: {
          actions: [assign((ctx, {ad}) => ({...ctx, ...ad})), log()],
        },
        SUBMIT: 'submitting',
      },
      initial: 'idle',
      states: {
        idle: {},
        invalid: {},
      },
    },
    validating: {
      invoke: {
        src: ({title, cover}) => title && cover,
        onDone: 'submitting',
        onError: 'editing.invalid',
      },
    },
    submitting: {
      invoke: {
        src: 'submit',
        onDone: 'success',
        onError: 'failure',
      },
    },
    failure: {
      entry: [log()],
      on: {
        RETRY: 'submitting',
      },
    },
    success: {
      entry: [log(), 'onSuccess'],
      type: 'final',
    },
  },
})

export const adFormMachine = Machine({
  id: 'adForm',
  context: {
    title: '',
    cover: '',
    url: '',
    location: '',
    lang: '',
    age: 0,
    os: '',
    stake: 0,
  },
  initial: 'editing',
  states: {
    editing: {
      on: {
        CHANGE: {
          target: '.idle',
          actions: [
            assign((ctx, {ad}) => ({
              ...ctx,
              ...ad,
            })),
            'change',
          ],
        },
      },
      initial: 'idle',
      states: {
        idle: {},
        invalid: {},
      },
    },
  },
})
