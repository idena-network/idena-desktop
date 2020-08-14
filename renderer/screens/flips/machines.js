import {Machine, assign, spawn, sendParent} from 'xstate'
import {log, send} from 'xstate/lib/actions'
import nanoid from 'nanoid'
import {
  fetchKeywordTranslations,
  voteForKeywordTranslation,
  suggestKeywordTranslation,
  publishFlip,
  updateFlipType,
  DEFAULT_FLIP_ORDER,
} from './utils'
import {callRpc} from '../../shared/utils/utils'
import {shuffle} from '../../shared/utils/arr'
import {FlipType, FlipFilter} from '../../shared/types'
import {fetchTx, deleteFlip} from '../../shared/api'
import {HASH_IN_MEMPOOL} from '../../shared/hooks/use-tx'
import {persistState} from '../../shared/utils/persist'

export const flipsMachine = Machine(
  {
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
          ({epoch: {epoch}}) => {
            console.log(epoch)
            // if (didValidate(epoch) && !didArchiveFlips(epoch)) {
            //   archiveFlips()
            //   markFlipsArchived(epoch)
            // }
            // if (
            //   shouldExpectValidationResults(epoch) &&
            //   !hasPersistedValidationResults(epoch)
            // ) {
            //   persistItem('validationResults', epoch, {
            //     epochStart: new Date().toISOString(),
            //   })
            // }
          },
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
              .map(
                ({pics, compressedPics, hint, images, keywords, ...flip}) => ({
                  ...flip,
                  images: images || compressedPics || pics,
                  keywords: keywords || hint || [],
                  pics,
                  compressedPics,
                  hint,
                })
              )

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
              FILTER: {
                target: '.unknown',
                actions: [
                  assign({
                    filter: (_, {filter}) => filter,
                  }),
                  'persistFilter',
                  log(),
                ],
              },
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
                      updateFlipType(flips, {id, type: FlipType.Draft}),
                  }),
                  log(),
                ],
              },
              DELETE_FAILED: {
                actions: ['onError'],
              },
              ARCHIVED: {
                actions: [
                  assign({
                    flips: ({flips}, {id}) =>
                      updateFlipType(flips, {id, type: FlipType.Archived}),
                  }),
                  log(),
                ],
              },
              REMOVED: {
                actions: [
                  assign({
                    flips: ({flips}, {id}) =>
                      flips.filter(flip => flip.id !== id),
                  }),
                  log(),
                ],
              },
            },
            initial: 'unknown',
            states: {
              unknown: {
                on: {
                  '': [
                    {
                      target: 'active',
                      cond: ({filter}) => filter === FlipFilter.Active,
                    },
                    {
                      target: 'draft',
                      cond: ({filter}) => filter === FlipFilter.Draft,
                    },
                    {
                      target: 'archived',
                      cond: ({filter}) => filter === FlipFilter.Archived,
                    },
                  ],
                },
              },
              active: {},
              draft: {},
              archived: {},
            },
          },
        },
      },
      failure: {
        entry: log(),
      },
    },
  },
  {
    actions: {
      persistFilter: ({filter}) => persistState('flipFilter', filter),
    },
  }
)

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
          ARCHIVE: {
            actions: [
              assign({
                type: FlipType.Archived,
              }),
              sendParent(({id}) => ({
                type: 'ARCHIVED',
                id,
              })),
              'persistFlip',
            ],
          },
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
                    error: (_, {data: {message}}) => message,
                  }),
                  sendParent(({error}) => ({type: 'PUBLISH_FAILED', error})),
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
            on: {
              PUBLISH: 'submitting',
            },
          },
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
      published: {
        on: {
          DELETE: 'deleting',
        },
      },
      deleting: {
        initial: 'submitting',
        states: {
          submitting: {
            invoke: {
              src: 'deleteFlip',
              onDone: {
                target: 'mining',
                actions: [
                  assign((context, {data}) => ({
                    ...context,
                    txHash: data,
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
                    error: (_, {data: {message}}) => message,
                  }),
                  sendParent(({error}) => ({type: 'DELETE_FAILED', error})),
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
            on: {
              DELETE: 'submitting',
            },
          },
        },
        on: {
          MINED: {
            target: 'deleted',
            actions: [
              assign({type: FlipType.Draft}),
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
      deleted: {
        on: {
          PUBLISH: 'publishing',
        },
      },
      invalid: {},
      removed: {
        type: 'final',
      },
    },
  },
  {
    services: {
      publishFlip: context => publishFlip(context),
      deleteFlip: async ({hash}) => {
        const {result, error} = await deleteFlip(hash)
        if (error) throw new Error(error.message)
        return result
      },
      pollStatus: ({txHash}) => cb => {
        let timeoutId

        const fetchStatus = async () => {
          const {result} = await fetchTx(txHash)
          if (result) {
            if (result.blockHash !== HASH_IN_MEMPOOL) cb('MINED')
            else {
              timeoutId = setTimeout(fetchStatus, 10 * 1000)
            }
          } else cb('TX_NULL')
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

export const flipMasterMachine = Machine(
  {
    id: 'flipMaster',
    context: {
      keywordPairId: 0,
      keywords: {
        words: [],
        translations: [[], []],
      },
      images: Array.from({length: 4}),
      originalOrder: DEFAULT_FLIP_ORDER,
      order: DEFAULT_FLIP_ORDER,
      orderPermutations: DEFAULT_FLIP_ORDER,
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
    initial: 'prepare',
    states: {
      prepare: {
        invoke: {
          src: 'prepareFlip',
          onDone: {
            target: 'editing',
            actions: [
              assign((context, {data}) => ({
                ...context,
                ...data,
              })),
              log(),
            ],
          },
          onError: {
            actions: [log()],
          },
        },
      },
      editing: {
        initial: 'keywords',
        states: {
          keywords: {
            on: {
              CHANGE_KEYWORDS: {
                target: '.loading',
                actions: assign({
                  keywordPairId: ({keywordPairId, availableKeywords}) => {
                    if (availableKeywords.length === 0) return 0

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
              TOGGLE_COMMUNITY_TRANSLATIONS: {
                actions: [
                  assign({
                    isCommunityTranslationsExpanded: ({
                      isCommunityTranslationsExpanded,
                    }) => !isCommunityTranslationsExpanded,
                  }),
                ],
              },
              NEXT: 'images',
            },
            initial: 'loading',
            states: {
              loading: {
                invoke: {
                  src: 'loadKeywords',
                  onDone: {
                    target: 'loaded',
                    actions: [
                      assign({
                        keywords: ({keywords}, {data}) => ({
                          ...keywords,
                          words: data,
                        }),
                      }),
                      log(),
                    ],
                  },
                  onError: 'failure',
                },
              },
              loaded: {
                initial: 'fetchingTranslations',
                states: {
                  fetchingTranslations: {
                    invoke: {
                      src: 'loadTranslations',
                      onDone: {
                        target: 'fetchedTranslations',
                        actions: [
                          assign({
                            keywords: ({keywords}, {data}) => ({
                              ...keywords,
                              translations: data,
                            }),
                            showTranslation: ({locale}, {data}) =>
                              locale.toLowerCase() !== 'en' &&
                              data?.every(w => w?.some(t => t?.confirmed)),
                          }),
                          log(),
                        ],
                      },
                      onError: 'fetchTranslationsFailed',
                    },
                  },
                  fetchedTranslations: {
                    on: {
                      REFETCH: 'fetchingTranslations',
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
                            actions: [send('REFETCH'), log()],
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
                            actions: [send('REFETCH'), log()],
                          },
                          onError: {
                            target: 'idle',
                            actions: ['onError', log()],
                          },
                        },
                      },
                    },
                  },
                  fetchTranslationsFailed: {},
                },
              },
              failure: {
                entry: [log()],
              },
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
              SHUFFLE: {
                actions: [
                  send(({order}) => ({
                    type: 'CHANGE_ORDER',
                    order: shuffle(order.slice()),
                  })),
                  log(),
                ],
              },
              MANUAL_SHUFFLE: {
                actions: [
                  send((_, {order}) => ({
                    type: 'CHANGE_ORDER',
                    order,
                  })),
                  log(),
                ],
              },
              RESET_SHUFFLE: {
                actions: [
                  send(({originalOrder}) => ({
                    type: 'CHANGE_ORDER',
                    order: originalOrder,
                  })),
                  log(),
                ],
              },
              CHANGE_ORDER: {
                target: '.persisting',
                actions: ['changeOrder', log()],
              },
              NEXT: 'submit',
              PREV: 'images',
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
              failure: {entry: ['onError']},
            },
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
      loadKeywords: async ({availableKeywords, keywordPairId}) => {
        const {words} = availableKeywords.find(({id}) => id === keywordPairId)
        return words.map(id => ({id, ...global.loadKeyword(id)}))
      },
      loadTranslations: async ({availableKeywords, keywordPairId, locale}) => {
        const {words} = availableKeywords.find(({id}) => id === keywordPairId)
        return fetchKeywordTranslations(words, locale)
      },
      persistFlip: (
        {
          id,
          keywordPairId,
          originalOrder,
          order,
          orderPermutations,
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
          'CHANGE_ORDER',
        ]

        if (persistingEventTypes.includes(event.type)) {
          let nextFlip = {
            keywordPairId,
            originalOrder,
            order,
            orderPermutations,
            images,
            keywords,
          }

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
      changeOrder: assign({
        order: (_, {order}) => order,
        orderPermutations: ({originalOrder}, {order}) =>
          order.map(n => originalOrder.findIndex(o => o === n)),
      }),
      persistFlip: context => {
        global.flipStore.updateDraft(context)
      },
    },
  }
)

export const createViewFlipMachine = id =>
  Machine(
    {
      context: {
        id,
        keywords: {
          words: [],
          translations: [],
        },
        order: [],
        originalOrder: [],
      },
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            src: 'loadFlip',
            onDone: {
              target: 'fetchingTranslations',
              actions: [
                assign((context, {data}) => ({...context, ...data})),
                log(),
              ],
            },
          },
        },
        fetchingTranslations: {
          invoke: {
            src: 'loadTranslations',
            onDone: {
              target: 'loaded',
              actions: [
                assign({
                  keywords: ({keywords}, {data}) => ({
                    ...keywords,
                    translations: data,
                  }),
                  showTranslation: ({locale}, {data}) =>
                    locale.toLowerCase() !== 'en' &&
                    data?.every(w => w?.some(t => t?.confirmed)),
                }),
                send('LOADED'),
                log(),
              ],
            },
            onError: 'loaded',
          },
        },
        loaded: {
          on: {
            DELETE: '.deleting',
            ARCHIVE: {
              actions: [
                assign({
                  type: FlipType.Archived,
                }),
                'onDeleted',
                'persistFlip',
              ],
            },
            SWITCH_LOCALE: {
              actions: [
                assign({
                  showTranslation: ({showTranslation}) => !showTranslation,
                }),
              ],
            },
          },
          initial: 'idle',
          states: {
            idle: {},
            deleting: {
              initial: 'submitting',
              states: {
                submitting: {
                  invoke: {
                    src: 'deleteFlip',
                    onDone: {
                      actions: [
                        assign((context, {data}) => ({
                          ...context,
                          txHash: data,
                          type: FlipType.Deleting,
                        })),
                        'persistFlip',
                        'onDeleted',
                        log(),
                      ],
                    },
                    onError: {
                      target: 'failure',
                      actions: [
                        assign({
                          error: (_, {data: {message}}) => message,
                        }),
                        'onDeleteFailed',
                        log(),
                      ],
                    },
                  },
                },
                failure: {
                  on: {
                    DELETE: 'submitting',
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      services: {
        deleteFlip: async ({hash}) => callRpc('flip_delete', hash),
        loadTranslations: async ({keywords, locale}) =>
          fetchKeywordTranslations(
            (keywords?.words ?? []).map(({id: wordId}) => wordId),
            locale
          ),
      },
      actions: {
        persistFlip: context => {
          global.flipStore.updateDraft(context)
        },
      },
    }
  )
