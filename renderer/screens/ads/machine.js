/* eslint-disable no-use-before-define */
import {Machine, assign, spawn, sendParent} from 'xstate'
import {log} from 'xstate/lib/actions'
import nanoid from 'nanoid'

export const adsMachine = Machine({
  id: 'ads',
  context: {
    newAd: null,
    ads: [],
  },
  initial: 'init',
  states: {
    init: {
      entry: assign({
        // eslint-disable-next-line no-shadow
        ads: ({ads}) =>
          ads.map(ad => ({
            ...ad,
            ref: spawn(adMachine.withContext(ad)),
          })),
      }),
      on: {
        '': 'all',
      },
    },
    all: {
      entry: log(),
    },
  },
  on: {
    'NEW_AD.CHANGE': {
      actions: [
        assign({
          newAd: ({newAd}, e) => ({...newAd, ...e}),
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
            assign((ctx, e) => ({
              ...ctx,
              ...e,
            })),
          ],
        },
        SAVE: {
          target: 'idle',
          actions: [sendParent(ctx => ({type: 'AD.COMMIT', ad: ctx}))],
        },
      },
    },
    publishing: {},
    idle: {},
  },
})
