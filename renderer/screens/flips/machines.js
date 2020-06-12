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
import {submitFlip} from '../../shared/api'
import {toHex} from '../../shared/hooks/use-flips'
import words from './utils/words'


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
              .map(({words}) => words.map(w => ({name: `word${w}`})))

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
            SUBMITTED: {
              actions: [
                assign({
                  flips: ({flips}, {flip}) =>
                    flips.map(currentFlip =>
                      currentFlip.id === flip.id
                        ? {...currentFlip, ...flip, ref: currentFlip.ref}
                        : flip
                    ),
                }),
                log(),
              ],
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

export const flipMachine = Machine({
  id: 'flip',
  context: {
    images: [],
  },
  initial: 'idle',
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: 'publishing',
          actions: [log()],
        },
        DELETE: {
          actions: [
            assign({
              flips: ({flips}, {id}) => {
                //   // callRpc("flip_delete", hash)
                //   deletePersistedFlip(id)
                const idx = flips.findIndex(f => f.id === id)
                return [
                  ...flips.slice(0, idx),
                  {
                    ...flips[idx],
                    type: FlipType.Deleting,
                  },
                  ...flips.slice(idx + 1),
                ]
              },
            }),
          ],
        },
      },
    },
    publishing: {
      initial: 'submitting',
      states: {
        submitting: {
          invoke: {
            src: ({images, order, keywordPairId}) =>
              submitFlip(...toHex(images, order), keywordPairId),
            onDone: {
              target: '#flip.mining',
              actions: [
                assign((flip, {hash}) => ({
                  ...flip,
                  type: FlipType.Publishing,
                  hash,
                })),
                flip => sendParent('SUBMITTED', {flip}),
                log(),
              ],
            },
            onError: {target: 'failure', actions: [log()]},
          },
        },
        failure: {},
      },
    },
    mining: {},
    published: {},
    deleting: {},
    deleted: {},
  },
})

export const flipEditMachine = Machine({
  id: 'flipEdit',
  context: {
    id: null,
  },
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
                actions: assign({
                  order: ({order}) => shuffle(order),
                }),
              },
              RESET_SHUFFLE: {
                actions: assign({
                  order: [0, 1, 2, 3],
                }),
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

        if (event.type === 'CHANGE_IMAGES') {
          const {image, currentIndex} = event

          nextFlip = {
            ...nextFlip,
            images: [
              ...images.slice(0, currentIndex),
              image,
              ...images.slice(currentIndex + 1),
            ],
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
