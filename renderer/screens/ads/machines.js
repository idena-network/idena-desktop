/* eslint-disable no-use-before-define */
import {Machine, assign, spawn, sendParent} from 'xstate'
import {log} from 'xstate/lib/actions'
import nanoid from 'nanoid'

export const adsMachine = Machine({
  id: 'ads',
  context: {
    newAd: null,
    selected: {},
    ads: [],
  },
  initial: 'init',
  states: {
    init: {
      entry: [
        assign({
          // eslint-disable-next-line no-shadow
          ads: ({ads}) =>
            ads.map(ad => ({
              ...ad,
              ref: spawn(adMachine.withContext(ad)),
            })),
        }),
        log(),
      ],
      on: {
        '': 'ready',
      },
    },
    ready: {
      entry: log(),
    },
  },
  on: {
    'NEW_AD.CHANGE': {
      actions: [
        assign({
          newAd: ({newAd}, {type, ...ad}) => ({...newAd, ...ad}),
        }),
        log(),
      ],
      cond: (_, e) => Boolean(e),
    },
    'NEW_AD.COMMIT': {
      actions: [
        assign({
          newAd: {},
          ads: ({newAd, ads}) =>
            ads.concat({
              ...newAd,
              id: nanoid(),
              ref: spawn(adMachine.withContext(newAd)),
            }),
        }),
        log(),
        'persist',
      ],
      cond: ({newAd}) => Boolean(newAd),
    },
    'AD.COMMIT': {
      actions: [
        assign({
          ads: ({ads}, e) =>
            ads.map(ad =>
              ad.id === e.ad.id ? {...ad, ...e.ad, ref: ad.ref} : ad
            ),
        }),
        'persist',
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
            assign((ctx, {type, ...ad}) => ({
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
  context: {},
  initial: 'editing',
  states: {
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
      entry: 'onSuccess',
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
            assign((ctx, {type, ...value}) => ({
              ...ctx,
              ...value,
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
