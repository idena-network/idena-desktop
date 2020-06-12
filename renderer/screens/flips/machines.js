import {Machine, assign, spawn, sendParent} from 'xstate'
import {log, send, forwardTo} from 'xstate/lib/actions'
import nanoid from 'nanoid'
import {
  fetchKeywordTranslations,
  voteForKeywordTranslation,
  suggestKeywordTranslation,
} from './utils'
import {shuffle} from '../../shared/utils/arr'
import {FlipType} from '../../shared/types'
import {submitFlip, fetchTx, deleteFlip} from '../../shared/api'
import {toHex} from '../../shared/hooks/use-flips'
// import words from './utils/words'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'

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
        // ({epoch}) => epochDb('flips', epoch).clear(),
      ],
    },
  },
  initial: 'initializing',
  states: {
    initializing: {
      invoke: {
        src: async ({epoch, knownFlips, availableKeywords}) => {
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

          // persistedFlips = persistedFlips.map(({images, ...flip}) => ({
          //   ...flip,
          //   images: images.map(buffer => buffer && bufferToImage(buffer)),
          // }))

          let missingFlips = knownFlips.filter(
            hash => !persistedFlips.includes(hash)
          )

          if (missingFlips.length) {
            const keywords = availableKeywords
              .filter(({id}) =>
                persistedFlips.some(({keywordPairId}) => keywordPairId !== id)
              )
              .map(({words}) => words.map(global.loadKeyword))

            missingFlips = missingFlips.map((hash, idx) => ({
              hash,
              keywords: keywords[idx],
              images: Array.from({length: 4}),
            }))
          }

          return {persistedFlips, missingFlips}
        },
        onDone: {
          target: 'ready.dirty',
          actions: [
            assign({
              flips: (_, {data: {persistedFlips, missingFlips}}) =>
                persistedFlips
                  .map(flip => ({
                    ...flip,
                    ref: spawn(
                      // eslint-disable-next-line no-use-before-define
                      flipMachine.withContext(flip),
                      `flip-${flip.id}`
                    ),
                  }))
                  .concat(missingFlips),
            }),
            log(),
          ],
        },
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
      on: {
        FLIP_ADDED: {
          target: '.dirty.hist',
          actions: [
            assign({
              flips: ({flips}, {data}) =>
                flips.concat({
                  ...data,
                  // eslint-disable-next-line no-use-before-define
                  ref: spawn(flipMachine.withContext(data), `flip-${data.id}`),
                }),
            }),
            log(),
          ],
        },
      },
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
    context: {
      images: [],
    },
    initial: 'idle',
    states: {
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
              src: 'submitFlip',
              onDone: {
                target: 'mining',
                actions: [
                  assign((context, {data: {result}}) => ({
                    ...context,
                    ...result,
                    type: FlipType.Publishing,
                  })),
                  sendParent(({id}) => ({
                    type: 'PUBLISHING',
                    id,
                  })),
                  log(),
                ],
              },
              onError: {
                target: 'failure',
                actions: [
                  assign({
                    error: (_, {data: {message}}) => message,
                  }),
                  'onPublishFailed',
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
          failure: {
            entry: sendParent(({error}) => ({type: 'PUBLISH_FAILED', error})),
          },
        },
        on: {
          MINED: 'published',
        },
      },
      published: {
        entry: [
          assign({type: FlipType.Published}),
          sendParent(({id}) => ({
            type: 'PUBLISHED',
            id,
          })),
          log(),
        ],
      },
      deleting: {
        states: {
          submitting: {
            invoke: {
              src: ({hash}) => deleteFlip(hash),
              onDone: {
                target: 'mining',
                actions: sendParent(({id}) => ({
                  type: 'DELETING',
                  id,
                })),
              },
            },
          },
          mining: {
            invoke: {
              src: 'pollStatus',
            },
          },
          failure: {
            entry: sendParent(({error}) => ({type: 'DELETE_FAILED', error})),
          },
        },
        on: {
          MINED: 'deleted',
        },
      },
      deleted: {
        entry: [
          assign({type: FlipType.Archived}),
          sendParent(({id}) => ({
            type: 'DELETED',
            id,
          })),
        ],
      },
    },
  },
  {
    services: {
      submitFlip: async ({images, order, keywordPairId}) => {
        const {result, error} = await submitFlip(
          ...toHex(images, order),
          keywordPairId
        )
        if (error) throw new Error(error.message)
        return result
      },
      pollStatus: ({hash}) => cb => {
        const fetchStatus = async () => {
          const {blockHash} = await fetchTx(hash)
          if (blockHash !== HASH_IN_MEMPOOL) cb('MINED')
          else return setTimeout(fetchStatus, 10 * 1000)
        }

        const timeoutId = fetchStatus(hash)

        return () => {
          clearTimeout(timeoutId)
        }
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
          actions: [
            assign((_, {data: {images, ...flip}}) => ({
              ...flip,
              images,
              // images: images.map(buffer => buffer && bufferToImage(buffer)),
            })),
            log(),
          ],
        },
        onError: 'failure',
      },
    },
    loaded: {},
    failure: {entry: log()},
  },
})

export const flipMasterMachine = Machine(
  {
    id: 'flipMaster',
    context: {
      keywordPairId: 0,
      order: [0, 1, 2, 3],
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
                      }),
                      log(),
                    ],
                  },
                },
              },
              done: {
                initial: 'checkTranslation',
                states: {
                  checkTranslation: {
                    on: {
                      '': [
                        {
                          target: 'translated',
                          cond: 'hasApprovedTranslation',
                        },
                        'origin',
                      ],
                    },
                  },
                  origin: {
                    on: {
                      SWITCH_LOCALE: 'translated',
                    },
                  },
                  translated: {
                    on: {
                      SWITCH_LOCALE: 'origin',
                    },
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
                                  translations: translations.map(
                                    wordTranslations =>
                                      wordTranslations.map(translation =>
                                        translation.id === id
                                          ? {
                                              ...translation,
                                              ups:
                                                translation.ups + (up ? 1 : -1),
                                            }
                                          : translation
                                      )
                                  ),
                                }),
                              }),
                              log(),
                            ],
                          },
                          onError: 'failure',
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
                          onError: 'failure',
                        },
                      },
                      failure: {
                        entry: log(),
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
              NEXT: 'shuffle',
              PREV: 'keywords',
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
          shuffle: {
            on: {
              NEXT: 'submit',
              PREV: 'images',
              SHUFFLE: {
                target: '.persisting',
                actions: assign({
                  order: ({order}) => shuffle(order),
                }),
              },
              RESET_SHUFFLE: {
                target: '.persisting',
                actions: assign({
                  order: [0, 1, 2, 3],
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
                      assign((context, {data}) => ({
                        ...context,
                        ...data,
                      })),
                    ],
                  },
                  onError: {target: 'failure', actions: [log()]},
                },
              },
              failure: {},
              done: {
                entry: ['onSubmitted', log()],
              },
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
          COMMIT: [
            {
              actions: 'persist',
              cond: ctx => ctx.title.trim().length > 0,
            },
          ],
          CANCEL: {
            actions: ['onCancel'],
          },
        },
      },
    },
  },
  {
    services: {
      loadKeywords: async ({availableKeywords, keywordPairId}) => {
        // eslint-disable-next-line no-shadow
        const {words} = availableKeywords.find(({id}) => id === keywordPairId)
        return {
          words: words.map(id => ({id, ...global.loadKeyword(id)})),
          translations: await fetchKeywordTranslations(words),
        }
      },
      persistFlip: (
        {id, keywordPairId, order, images, keywords, type, createdAt},
        event
      ) => cb => {
        const persistingEventTypes = [
          'CHANGE_IMAGES',
          'SHUFFLE',
          'RESET_SHUFFLE',
        ]

        if (persistingEventTypes.includes(event.type)) {
          let nextFlip = {keywordPairId, order, images, keywords}

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
        {keywords: {words}},
        {name, desc, wordIdx}
      ) =>
        suggestKeywordTranslation({
          wordId: words[wordIdx].id,
          name,
          desc,
        }),
    },
    guards: {
      hasApprovedTranslation: ({keywords}) =>
        global.locale !== 'EN' && keywords.translations.some(t => t.confirmed),
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
