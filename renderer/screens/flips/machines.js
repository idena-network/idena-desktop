import {Machine, assign, spawn, sendParent} from 'xstate'
import {log} from 'xstate/lib/actions'
import nanoid from 'nanoid'
import {
  fetchKeywordTranslations,
  voteForKeywordTranslation,
  suggestKeywordTranslation,
} from './utils'
import {shuffle} from '../../shared/utils/arr'
import {FlipType} from '../../shared/types'
import {fetchTx, deleteFlip} from '../../shared/api'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'
import {publishFlip, DEFAULT_FLIP_ORDER} from './utils/flip'

export const flipsMachine = Machine({
  id: 'flips',
  context: {
    flips: null,
    epoch: null,
    knownFlips: [],
    availableKeywords: [],
  },
  on: {
    EPOCH: {
      actions: [
        assign({
          flips: [],
        }),
      ],
    },
  },
  initial: 'initializing',
  states: {
    initializing: {
      invoke: {
        src: async ({knownFlips, availableKeywords}) => {
          const flipDb = global.flipStore

          const persistedFlips = flipDb
            .getFlips()
            .map(({pics, hint, images, keywords, ...flip}) => ({
              ...flip,
              images: images || pics,
              keywords: keywords || hint || [],
              pics,
              hint,
            }))

          const persistedHashes = persistedFlips.map(flip => flip.hash)

          let missingFlips = knownFlips.filter(
            hash => !persistedHashes.includes(hash)
          )

          if (missingFlips.length) {
            const keywords = availableKeywords
              .filter(({id}) =>
                persistedFlips.some(({keywordPairId}) => keywordPairId !== id)
              )
              .map(({id, words}) => ({
                id,
                words: words.map(global.loadKeyword),
              }))

            missingFlips = missingFlips.map((hash, idx) => ({
              hash,
              keywords: keywords[idx],
              images: Array.from({length: 4}),
            }))
          }

          return {persistedFlips, missingFlips}
        },
        onDone: [
          {
            target: 'ready.pristine',
            actions: log(),
            cond: (_, {data: {persistedFlips, missingFlips}}) =>
              persistedFlips.concat(missingFlips).length === 0,
          },
          {
            target: 'ready.dirty',
            actions: [
              assign({
                flips: (_, {data: {persistedFlips}}) =>
                  persistedFlips.map(flip => ({
                    ...flip,
                    ref: spawn(
                      // eslint-disable-next-line no-use-before-define
                      flipMachine.withContext(flip),
                      `flip-${flip.id}`
                    ),
                  })),
                missingFlips: (_, {data: {missingFlips}}) => missingFlips,
              }),
              log(),
            ],
          },
        ],
        onError: [
          {
            target: 'ready.pristine',
            actions: [
              assign({
                flips: [],
              }),
              log(),
            ],
            cond: (_, {data: error}) => error.notFound,
          },
          {
            target: 'failure',
            actions: [
              assign({
                flips: [],
              }),
              log(),
            ],
          },
        ],
      },
    },
    ready: {
      initial: 'pristine',
      states: {
        pristine: {},
        dirty: {
          on: {
            FILTER_ACTIVE: '.active',
            FILTER_DRAFTS: '.drafts',
            FILTER_ARCHIVE: '.archive',
            PUBLISHING: {
              actions: [
                assign({
                  flips: ({flips}, {id}) =>
                    updateFlipType(flips, {id, type: FlipType.Publishing}),
                }),
                log(),
              ],
            },
            PUBLISHED: {
              actions: [
                assign({
                  flips: ({flips}, {id}) =>
                    updateFlipType(flips, {id, type: FlipType.Published}),
                }),
                log(),
              ],
            },
            PUBLISH_FAILED: {
              actions: ['onError'],
            },
            DELETING: {
              actions: [
                assign({
                  flips: ({flips}, {id}) =>
                    updateFlipType(flips, {id, type: FlipType.Deleting}),
                }),
                log(),
              ],
            },
            DELETED: {
              actions: [
                assign({
                  flips: ({flips}, {id}) =>
                    updateFlipType(flips, {id, type: FlipType.Archived}),
                }),
                log(),
              ],
            },
            DELETE_FAILED: {
              actions: ['onError'],
            },
          },
          initial: 'active',
          states: {
            active: {},
            drafts: {},
            archive: {},
            hist: {
              type: 'history',
            },
          },
        },
      },
    },
    failure: {
      entry: log(),
    },
  },
})

export const flipMachine = Machine(
  {
    id: 'flip',
    initial: 'checkType',
    states: {
      checkType: {
        on: {
          '': [
            {
              target: 'publishing.mining',
              cond: ({type}) => type === FlipType.Publishing,
            },
            {
              target: 'deleting.mining',
              cond: ({type}) => type === FlipType.Deleting,
            },
            {target: 'idle'},
          ],
        },
      },
      idle: {
        on: {
          PUBLISH: 'publishing',
          DELETE: 'deleting',
        },
      },
      publishing: {
        initial: 'submitting',
        states: {
          submitting: {
            invoke: {
              src: 'publishFlip',
              onDone: {
                target: 'mining',
                actions: [
                  assign((context, {data: {txHash, hash}}) => ({
                    ...context,
                    txHash,
                    hash,
                    type: FlipType.Publishing,
                  })),
                  sendParent(({id}) => ({
                    type: 'PUBLISHING',
                    id,
                  })),
                  'persistFlip',
                  log(),
                ],
              },
              onError: {
                target: 'failure',
                actions: [
                  assign({
                    type: FlipType.Invalid,
                    error: (_, {data: {message}}) => message,
                  }),
                  sendParent(({error}) => ({type: 'PUBLISH_FAILED', error})),
                  'persistFlip',
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
          failure: {},
        },
        on: {
          MINED: {
            target: 'published',
            actions: [
              assign({type: FlipType.Published}),
              sendParent(({id}) => ({
                type: 'PUBLISHED',
                id,
              })),
              'persistFlip',
              log(),
            ],
          },
          TX_NULL: {
            target: 'invalid',
            actions: [
              assign({
                error: 'Publish tx is missing',
                type: FlipType.Invalid,
              }),
              'persistFlip',
            ],
          },
        },
      },
      published: {},
      deleting: {
        states: {
          submitting: {
            invoke: {
              src: 'deleteFlip',
              onDone: {
                target: 'mining',
                actions: [
                  assign((context, {data: {result}}) => ({
                    ...context,
                    txHash: result,
                    type: FlipType.Deleting,
                  })),
                  sendParent(({id}) => ({
                    type: 'DELETING',
                    id,
                  })),
                  'persistFlip',
                  log(),
                ],
              },
              onError: {
                target: 'failure',
                actions: [
                  assign({
                    type: FlipType.Invalid,
                    error: (_, {data: {message}}) => message,
                  }),
                  sendParent(({error}) => ({type: 'DELETE_FAILED', error})),
                  'persistFlip',
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
          failure: {},
        },
        on: {
          MINED: {
            target: 'deleted',
            actions: [
              assign({type: FlipType.Archived}),
              sendParent(({id}) => ({
                type: 'DELETED',
                id,
              })),
              'persistFlip',
            ],
          },
          TX_NULL: {
            target: 'invalid',
            actions: [
              assign({
                type: FlipType.Invalid,
                error: 'Delete tx is missing',
              }),
              'persistFlip',
            ],
          },
        },
      },
      deleted: {},
      invalid: {},
    },
  },
  {
    services: {
      publishFlip: context => publishFlip(context),
      deleteFlip: ({hash}) => deleteFlip(hash),
      pollStatus: ({txHash}) => cb => {
        let timeoutId

        const fetchStatus = async () => {
          const {result} = await fetchTx(txHash)

          if (result === null) cb('TX_NULL')

          if (result.blockHash !== HASH_IN_MEMPOOL) cb('MINED')
          else {
            timeoutId = setTimeout(fetchStatus, 10 * 1000)
          }
        }

        timeoutId = setTimeout(fetchStatus, 10 * 1000)

        return () => {
          clearTimeout(timeoutId)
        }
      },
    },
    actions: {
      persistFlip: context => {
        global.flipStore.updateDraft(context)
      },
    },
  }
)

export const flipEditMachine = Machine({
  id: 'flipEdit',
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: 'loadFlip',
        onDone: {
          target: 'loaded',
          actions: [assign((_, {data}) => data), log()],
        },
        onError: {target: 'failure', actions: [log()]},
      },
    },
    loaded: {},
    failure: {},
  },
})

export const flipMasterMachine = Machine(
  {
    id: 'flipMaster',
    context: {
      keywordPairId: 0,
      originalOrder: DEFAULT_FLIP_ORDER,
      order: DEFAULT_FLIP_ORDER,
    },
    on: {
      SWITCH_LOCALE: {
        actions: [
          assign({
            showTranslation: ({showTranslation}) => !showTranslation,
          }),
        ],
      },
    },
    initial: 'editing',
    states: {
      editing: {
        initial: 'keywords',
        states: {
          keywords: {
            on: {
              CHANGE_KEYWORDS: {
                target: '.fetching',
                actions: assign({
                  keywordPairId: ({keywordPairId, availableKeywords}) => {
                    const currentIdx = availableKeywords.findIndex(
                      // eslint-disable-next-line no-shadow
                      ({id}) => id === keywordPairId
                    )
                    const nextIdx = (currentIdx + 1) % availableKeywords.length
                    const {id} = availableKeywords[nextIdx]
                    return id
                  },
                }),
              },
              NEXT: 'images',
            },
            initial: 'fetching',
            states: {
              fetching: {
                invoke: {
                  src: 'loadKeywords',
                  onDone: {
                    target: 'done',
                    actions: [
                      assign({
                        keywords: (_, {data}) => data,
                        showTranslation: ({locale}, {data}) =>
                          locale.toLowerCase() !== 'en' &&
                          data.translations.some(t => t.confirmed),
                      }),
                      log(),
                    ],
                  },
                },
              },
              done: {
                initial: 'idle',
                states: {
                  idle: {
                    on: {
                      VOTE: 'voting',
                      SUGGEST: 'suggesting',
                    },
                  },
                  voting: {
                    invoke: {
                      src: 'voteForKeywordTranslation',
                      onDone: {
                        target: 'idle',
                        actions: [
                          assign({
                            keywords: (
                              // eslint-disable-next-line no-shadow
                              {keywords: {words, translations}},
                              {data: {id, up}}
                            ) => ({
                              words,
                              translations: translations.map(wordTranslations =>
                                wordTranslations.map(translation =>
                                  translation.id === id
                                    ? {
                                        ...translation,
                                        ups: translation.ups + (up ? 1 : -1),
                                      }
                                    : translation
                                )
                              ),
                            }),
                          }),
                          log(),
                        ],
                      },
                      onError: {
                        target: 'idle',
                        actions: ['onError', log()],
                      },
                    },
                  },
                  suggesting: {
                    invoke: {
                      src: 'suggestKeywordTranslation',
                      onDone: {
                        target: 'idle',
                        actions: [
                          assign({
                            keywords: (
                              // eslint-disable-next-line no-shadow
                              {keywords: {words, translations}},
                              {data: {wordId, id, name, desc}}
                            ) => {
                              const wordIdx = words.findIndex(
                                word => word.id === wordId
                              )
                              return {
                                words,
                                translations: translations.map(
                                  (wordTranslations, idx) =>
                                    idx === wordIdx
                                      ? wordTranslations.concat({
                                          wordId,
                                          id,
                                          name,
                                          desc,
                                          ups: 0,
                                        })
                                      : wordTranslations
                                ),
                              }
                            },
                          }),
                          log(),
                        ],
                      },
                      onError: {
                        target: 'idle',
                        actions: ['onError', log()],
                      },
                    },
                  },
                },
              },
              failure: {},
            },
          },
          images: {
            on: {
              CHANGE_IMAGES: {
                target: '.persisting',
                actions: [
                  assign({
                    images: ({images}, {image, currentIndex}) => [
                      ...images.slice(0, currentIndex),
                      image,
                      ...images.slice(currentIndex + 1),
                    ],
                  }),
                  log(),
                ],
              },
              CHANGE_ORIGINAL_ORDER: {
                target: '.persisting',
                actions: [
                  assign({
                    originalOrder: (_, {order}) => order,
                    order: (_, {order}) => order,
                  }),
                  log(),
                ],
              },
              PAINTING: '.painting',
              NEXT: 'shuffle',
              PREV: 'keywords',
            },
            initial: 'idle',
            states: {
              idle: {},
              painting: {},
              persisting: {
                invoke: {
                  id: 'persistFlip',
                  src: 'persistFlip',
                },
                on: {
                  PERSISTED: {
                    target: 'idle',
                    actions: [
                      assign((context, {flip}) => ({...context, ...flip})),
                      log(),
                    ],
                  },
                },
              },
            },
          },
          shuffle: {
            on: {
              NEXT: 'submit',
              PREV: 'images',
              SHUFFLE: {
                target: '.persisting',
                actions: [
                  assign({
                    order: ({order}) => shuffle(order.slice()),
                  }),
                  log(),
                ],
              },
              MANUAL_SHUFFLE: {
                target: '.persisting',
                actions: assign({
                  order: (_, {order}) => order,
                }),
              },
              RESET_SHUFFLE: {
                target: '.persisting',
                actions: assign({
                  order: ({originalOrder}) => originalOrder,
                }),
              },
            },
            initial: 'idle',
            states: {
              idle: {},
              persisting: {
                invoke: {
                  id: 'persistFlip',
                  src: 'persistFlip',
                },
                on: {
                  PERSISTED: {
                    target: 'idle',
                    actions: [
                      assign((context, {flip}) => ({...context, ...flip})),
                      log(),
                    ],
                  },
                },
              },
            },
          },
          submit: {
            on: {
              SUBMIT: '.submitting',
              PREV: 'shuffle',
            },
            initial: 'idle',
            states: {
              idle: {},
              submitting: {
                invoke: {
                  src: 'submitFlip',
                  onDone: {
                    target: 'done',
                    actions: [
                      assign((context, {data: {txHash, hash}}) => ({
                        ...context,
                        txHash,
                        hash,
                        type: FlipType.Publishing,
                      })),
                      'persistFlip',
                    ],
                  },
                  onError: {target: 'failure', actions: [log()]},
                },
              },
              done: {
                entry: ['onSubmitted', log()],
              },
              failure: {},
            },
          },
          hist: {
            type: 'history',
          },
        },
        on: {
          PICK_IMAGES: '.images',
          PICK_KEYWORDS: '.keywords',
          PICK_SHUFFLE: '.shuffle',
          PICK_SUBMIT: '.submit',
        },
      },
    },
  },
  {
    services: {
      loadKeywords: async ({availableKeywords, keywordPairId, locale}) => {
        // eslint-disable-next-line no-shadow
        const {words} = availableKeywords.find(({id}) => id === keywordPairId)
        return {
          words: words.map(id => ({id, ...global.loadKeyword(id)})),
          translations: await fetchKeywordTranslations(words, locale),
        }
      },
      persistFlip: (
        {
          id,
          keywordPairId,
          originalOrder,
          order,
          images,
          keywords,
          type,
          createdAt,
        },
        event
      ) => cb => {
        const persistingEventTypes = [
          'CHANGE_IMAGES',
          'CHANGE_ORIGINAL_ORDER',
          'SHUFFLE',
          'MANUAL_SHUFFLE',
          'RESET_SHUFFLE',
        ]

        if (persistingEventTypes.includes(event.type)) {
          let nextFlip = {keywordPairId, originalOrder, order, images, keywords}

          nextFlip = id
            ? {
                ...nextFlip,
                id,
                type,
                createdAt,
                modifiedAt: new Date().toISOString(),
              }
            : {
                ...nextFlip,
                id: nanoid(),
                createdAt: new Date().toISOString(),
                type: FlipType.Draft,
              }

          if (id) global.flipStore.updateDraft(nextFlip)
          else global.flipStore.addDraft(nextFlip)

          cb({type: 'PERSISTED', flip: nextFlip})
        }
      },
      voteForKeywordTranslation: async (_, e) => voteForKeywordTranslation(e),
      suggestKeywordTranslation: async (
        // eslint-disable-next-line no-shadow
        {keywords: {words}, locale},
        {name, desc, wordIdx}
      ) =>
        suggestKeywordTranslation({
          wordId: words[wordIdx].id,
          name,
          desc,
          locale,
        }),
    },
    actions: {
      persistFlip: context => {
        global.flipStore.updateDraft(context)
      },
    },
  }
)

function updateFlipType(flips, {id, type}) {
  return flips.map(flip =>
    flip.id === id
      ? {
          ...flip,
          type,
          ref: flip.ref,
        }
      : flip
  )
}
