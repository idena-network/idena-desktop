import {Machine, assign} from 'xstate'
import {log} from 'xstate/lib/actions'
import {fetchKeywordTranslations} from './utils'

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
    },
    initial: 'editing',
    states: {
      editing: {
        entry: assign({prevImages: ({images}) => images}),
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
              NEXT: 'editor',
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
                  },
                },
              },
            },
          },
          editor: {
            on: {
              CHANGE_IMAGES: {
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
          },
          shuffle: {
            on: {
              NEXT: 'submit',
              PREV: 'editor',
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
          PICK_IMAGES: '.editor',
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
            actions: [
              'onCancel',
              assign({images: ({prevImages}) => prevImages}),
            ],
          },
        },
      },
    },
  },
  {
    services: {
      loadKeywords: async ({availableKeywords, keywordPairId}) => {
        const {words} = availableKeywords.find(({id}) => id === keywordPairId)
        return {
          words: words.map(id => ({id, ...global.loadKeyword(id)})),
          translations: await fetchKeywordTranslations(words),
        }
      },
    },
    guards: {
      hasApprovedTranslation: ({keywords}) =>
        global.locale !== 'EN' &&
        keywords.translations.some(t => true || t.confirmed),
    },
  }
)
