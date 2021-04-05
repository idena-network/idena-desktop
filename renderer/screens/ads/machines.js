/* eslint-disable no-use-before-define */
import {Machine, assign, spawn, sendParent} from 'xstate'
import {log} from 'xstate/lib/actions'

export const adListMachine = Machine({
  id: 'ads',
  context: {
    newAd: null,
    selected: {},
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
              // eslint-disable-next-line no-shadow
              ads: (_, {data}) =>
                data.map(ad => ({
                  ...ad,
                  ref: spawn(adMachine.withContext(ad)),
                })),
            }),
            log(),
          ],
        },
        onError: {
          target: 'fail',
          actions: [log()],
        },
      },
    },
    ready: {
      entry: log(),
    },
    fail: {},
  },
  on: {
    'AD.COMMIT': {
      actions: [
        assign({
          ads: ({ads}, e) =>
            ads.map(ad =>
              ad.id === e.ad.id ? {...ad, ...e.ad, ref: ad.ref} : ad
            ),
        }),
      ],
      cond: (_, {ad}) => ad && ad.title,
    },
    SELECT: {
      actions: [
        assign({
          selected: ({ads}, {id}) => ads.find(a => a.id === id),
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
        SAVE: {
          target: 'idle',
          actions: [sendParent(ad => ({type: 'AD.COMMIT', ad})), log()],
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
      on: {
        RETRY: 'submitting',
      },
    },
    success: {
      entry: ['onSuccess'],
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
