/* eslint-disable no-use-before-define */
import {Machine, assign, spawn} from 'xstate'
import {log} from 'xstate/lib/actions'
import {AdStatus} from '../../shared/types'
import {byId} from '../../shared/utils/utils'
import {areSameCaseInsensitive} from '../oracles/utils'

export const adListMachine = Machine({
  id: 'adList',
  context: {
    selectedAd: {},
    ads: [],
    filteredAds: [],
    status: AdStatus.Active,
    totalSpent: 0,
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
              ads: (_, {data: {ads}}) => ads,
              filteredAds: ({status}, {data: {ads}}) =>
                ads
                  .filter(ad => areSameCaseInsensitive(ad.status, status))
                  .map(ad => ({
                    ...ad,
                    ref: spawn(adMachine.withContext(ad)),
                  })),
              totalSpent: (_, {data: {totalSpent}}) => totalSpent,
            }),
            log(),
          ],
        },
        onError: {target: 'fail', actions: [log()]},
      },
    },
    ready: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            FILTER: {
              actions: [
                assign({
                  status: (_, {value}) => value,
                  filteredAds: ({ads}, {value}) =>
                    ads.filter(({status}) =>
                      areSameCaseInsensitive(status, value)
                    ),
                }),
                log(),
              ],
            },
            REVIEW: {
              target: 'sendingToReview',
              actions: [
                assign({
                  selectedAd: ({ads}, ad) => ads.find(byId(ad)),
                }),
              ],
            },
            REMOVE_AD: {
              target: 'removingAd',
              actions: [
                assign({
                  ads: ({ads}, {id}) => ads.filter(ad => ad.id !== id),
                  filteredAds: ({filteredAds}, {id}) =>
                    filteredAds.filter(ad => ad.id !== id),
                }),
              ],
            },
          },
        },
        removingAd: {
          invoke: {
            src: 'removeAd',
            onDone: 'idle',
            onError: {actions: ['onError']},
          },
        },
        sendingToReview: {
          on: {
            CANCEL: 'idle',
          },
          initial: 'preview',
          states: {
            preview: {
              on: {
                SUBMIT: 'submitting',
              },
            },
            submitting: {
              entry: [log()],
              invoke: {
                src: 'sendToReview',
                onDone: {
                  target: 'miningDeploy',
                  actions: [
                    assign({
                      txDeployHash: (_, {data}) => data.txHash,
                      contractHash: (_, {data}) => data.contractHash,
                    }),
                    log(),
                  ],
                },
                onError: {actions: ['onError']},
              },
            },
            miningDeploy: {
              invoke: {src: 'pollDeployVoting'},
              on: {
                MINED: {
                  target: 'startingVoting',
                  actions: [log()],
                },
              },
            },
            startingVoting: {
              invoke: {
                src: 'startReviewVoting',
                onDone: {
                  target: 'miningStartVoting',
                  actions: [
                    assign({
                      txStartHash: (_, {data}) => data,
                    }),
                    log(),
                  ],
                },
              },
            },
            miningStartVoting: {
              invoke: {src: 'pollStartVoting'},
              on: {
                MINED: {
                  target: '#adList.ready.idle',
                  actions: [
                    assign(({ads, selectedAd, status}) => {
                      const applyReviewingStatus = ad => ({
                        ...ad,
                        status: AdStatus.Reviewing,
                      })

                      const nextAds = ads.map(ad =>
                        ad.id === selectedAd.id
                          ? {
                              ...applyReviewingStatus(ad),
                              ref: spawn(
                                adMachine.withContext(applyReviewingStatus(ad))
                              ),
                            }
                          : ad
                      )

                      return {
                        ads: nextAds,
                        filteredAds: nextAds.filter(ad => ad.status === status),
                        selectedAd: applyReviewingStatus(selectedAd),
                      }
                    }),
                    'onSentToReview',
                    log(),
                  ],
                },
                TX_NULL: {actions: ['onError']},
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
        CLOSE: 'closing',
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
      entry: ['onSuccess', log()],
      type: 'final',
    },
    closing: {
      invoke: {
        src: 'saveBeforeClose',
        onDone: {actions: ['onSaveBeforeClose']},
      },
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
