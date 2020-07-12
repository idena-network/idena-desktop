import {Machine, assign} from 'xstate'
import {decode} from 'rlp'
import {log} from 'xstate/lib/actions'
import dayjs from 'dayjs'
import {
  fetchFlipHashes,
  submitShortAnswers,
  submitLongAnswers,
} from '../../shared/api/validation'
import {SessionType} from '../../shared/types'
import {fetchFlip} from '../../shared/api'
import apiClient from '../../shared/api/api-client'
import {
  filterRegularFlips,
  filterReadyFlips,
  filterSolvableFlips,
  flipExtraFlip,
  readyNotFetchedFlip,
  availableExtraFlip,
  failedFlip,
  hasEnoughAnswers,
  missingHashes,
  exponentialBackoff,
  shouldTranslate,
  shouldPollLongFlips,
} from './utils'
import {forEachAsync, wait} from '../../shared/utils/fn'
import {fetchConfirmedKeywordTranslations} from '../flips/utils'

export const createValidationMachine = ({
  epoch,
  validationStart,
  shortSessionDuration,
  longSessionDuration,
  locale,
}) =>
  Machine(
    {
      id: 'validation',
      initial: 'shortSession',
      context: {
        shortFlips: [],
        longFlips: [],
        currentIndex: 0,
        epoch,
        validationStart,
        shortSessionDuration,
        longSessionDuration,
        errorMessage: null,
        retries: 0,
        locale,
        translations: {},
      },
      states: {
        shortSession: {
          entry: log('VALIDATION STARTED!'),
          type: 'parallel',
          states: {
            fetch: {
              entry: log('Start fetching short flips'),
              initial: 'polling',
              states: {
                polling: {
                  type: 'parallel',
                  states: {
                    fetchHashes: {
                      initial: 'fetching',
                      states: {
                        fetching: {
                          entry: log('Fetching short hashes'),
                          invoke: {
                            src: 'fetchShortHashes',
                            onDone: {
                              target: 'check',
                              actions: [
                                assign({
                                  shortFlips: ({shortFlips}, {data}) =>
                                    shortFlips.length
                                      ? mergeFlipsByHash(
                                          shortFlips,
                                          data.filter(({hash}) =>
                                            shortFlips.find(
                                              f => f.hash === hash && !f.flipped
                                            )
                                          )
                                        )
                                      : mergeFlipsByHash(data, shortFlips),
                                }),
                                log(),
                              ],
                            },
                          },
                        },
                        check: {
                          after: {
                            5000: [
                              {
                                target: '#validation.shortSession.fetch.done',
                                cond: 'didFetchShortFlips',
                              },
                              {target: 'fetching'},
                            ],
                          },
                        },
                      },
                    },
                    fetchFlips: {
                      initial: 'fetching',
                      states: {
                        fetching: {
                          invoke: {
                            src: 'fetchShortFlips',
                            onDone: {
                              target: 'check',
                              actions: [
                                assign({
                                  retries: ({retries}) => retries + 1,
                                }),
                              ],
                            },
                          },
                          on: {
                            FLIP: {
                              actions: [
                                assign({
                                  shortFlips: ({shortFlips, retries}, {flip}) =>
                                    mergeFlipsByHash(shortFlips, [
                                      {...flip, retries},
                                    ]),
                                }),
                                log(),
                              ],
                            },
                          },
                        },
                        check: {
                          entry: log(),
                          after: {
                            1000: [
                              {
                                target: '#validation.shortSession.fetch.done',
                                cond: 'didFetchShortFlips',
                              },
                              {target: 'fetching'},
                            ],
                          },
                        },
                      },
                    },
                  },
                },
                extraFlips: {
                  entry: log('bump extra flips'),
                  invoke: {
                    src: ({shortFlips}) => cb => {
                      const extraFlips = shortFlips.filter(availableExtraFlip)
                      const replacingFlips = shortFlips.filter(failedFlip)
                      cb({
                        type: 'EXTRA_FLIPS_PULLED',
                        flips:
                          extraFlips.length >= replacingFlips.length
                            ? replacingFlips
                                .map(flipExtraFlip)
                                .concat(
                                  extraFlips
                                    .slice(0, replacingFlips.length)
                                    .map(flipExtraFlip)
                                )
                            : replacingFlips
                                .slice(0, extraFlips.length)
                                .map(flipExtraFlip)
                                .concat(extraFlips.map(flipExtraFlip)),
                      })
                    },
                  },
                  on: {
                    EXTRA_FLIPS_PULLED: {
                      target: 'polling',
                      actions: [
                        assign({
                          shortFlips: ({shortFlips}, {flips}) =>
                            mergeFlipsByHash(shortFlips, flips),
                        }),
                        log(),
                      ],
                    },
                  },
                },
                done: {type: 'final', entry: log('Fetching short flips done')},
              },
              on: {
                REFETCH_FLIPS: {
                  target: '#validation.shortSession.fetch.polling.fetchFlips',
                  actions: [
                    assign({
                      shortFlips: ({shortFlips}) =>
                        shortFlips.map(flip => ({
                          ...flip,
                          fetched: false,
                          decoded: false,
                        })),
                    }),
                    log('Re-fetching flips after re-entering short session'),
                  ],
                },
              },
              after: {
                BUMP_EXTRA_FLIPS: {
                  target: '.extraFlips',
                  cond: ({shortFlips}) =>
                    shortFlips.some(failedFlip) &&
                    shortFlips.some(availableExtraFlip),
                },
                FINALIZE_FLIPS: {
                  target: '.done',
                  actions: [
                    assign({
                      shortFlips: ({shortFlips}) =>
                        mergeFlipsByHash(
                          shortFlips,
                          shortFlips.filter(failedFlip).map(flip => ({
                            ...flip,
                            failed: true,
                          }))
                        ),
                    }),
                    log(),
                  ],
                },
              },
            },
            solve: {
              type: 'parallel',
              states: {
                nav: {
                  initial: 'firstFlip',
                  states: {
                    firstFlip: {},
                    normal: {},
                    lastFlip: {},
                  },
                  on: {
                    PREV: [
                      {
                        target: undefined,
                        cond: ({shortFlips}) =>
                          filterRegularFlips(shortFlips).length === 0,
                      },
                      {
                        target: '.normal',
                        cond: ({currentIndex}) => currentIndex > 1,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex - 1,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.firstFlip',
                        cond: ({currentIndex}) => currentIndex === 1,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex - 1,
                          }),
                          log(),
                        ],
                      },
                    ],
                    NEXT: [
                      {
                        target: undefined,
                        cond: ({shortFlips}) =>
                          filterRegularFlips(shortFlips).length === 0,
                      },
                      {
                        target: '.lastFlip',
                        cond: ({currentIndex, shortFlips}) =>
                          currentIndex ===
                          filterRegularFlips(shortFlips).length - 2,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex + 1,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.normal',
                        cond: ({currentIndex, shortFlips}) =>
                          currentIndex <
                          filterRegularFlips(shortFlips).length - 2,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex + 1,
                          }),
                          log(),
                        ],
                      },
                    ],
                    PICK: [
                      {
                        target: '.firstFlip',
                        cond: (_, {index}) => index === 0,
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.lastFlip',
                        cond: ({shortFlips}, {index}) =>
                          index === filterRegularFlips(shortFlips).length - 1,
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.normal',
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                    ],
                  },
                },
                answer: {
                  initial: 'normal',
                  states: {
                    normal: {
                      on: {
                        ANSWER: {
                          actions: [
                            assign({
                              shortFlips: ({shortFlips}, {hash, option}) =>
                                mergeFlipsByHash(shortFlips, [{hash, option}]),
                            }),
                            log(),
                          ],
                        },
                        SUBMIT: {
                          target: 'submitShortSession',
                        },
                      },
                      after: {
                        SHORT_SESSION_AUTO_SUBMIT: [
                          {
                            target: 'submitShortSession',
                            cond: ({shortFlips}) =>
                              hasEnoughAnswers(shortFlips),
                          },
                          {
                            target: '#validation.validationFailed',
                          },
                        ],
                      },
                    },
                    submitShortSession: {
                      initial: 'submitting',
                      entry: log(),
                      states: {
                        submitting: {
                          invoke: {
                            // eslint-disable-next-line no-shadow
                            src: ({shortFlips, epoch}) =>
                              submitShortAnswers(
                                shortFlips.map(
                                  ({option: answer = 0, hash}) => ({
                                    answer,
                                    hash,
                                  })
                                ),
                                0,
                                epoch
                              ),
                            onDone: {
                              target: '#validation.longSession',
                              actions: [log()],
                            },
                            onError: {
                              target: 'fail',
                              actions: [
                                assign({
                                  errorMessage: (_, {data}) => data,
                                }),
                                log(
                                  (context, event) => ({context, event}),
                                  'Short session submit failed'
                                ),
                              ],
                            },
                          },
                        },
                        fail: {
                          on: {
                            RETRY_SUBMIT: {
                              target: 'submitting',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          exit: ['cleanupShortFlips'],
        },
        longSession: {
          entry: [
            assign({
              currentIndex: 0,
              retries: 0,
            }),
            log('Entering long session'),
          ],
          type: 'parallel',
          states: {
            fetch: {
              type: 'parallel',
              states: {
                flips: {
                  initial: 'fetchHashes',
                  entry: log('Start fetching long flips'),
                  states: {
                    fetchHashes: {
                      entry: log('Fetching long hashes'),
                      invoke: {
                        src: 'fetchLongHashes',
                        onDone: {
                          target: 'fetchFlips',
                          actions: [
                            assign({
                              longFlips: ({longFlips}, {data}) =>
                                mergeFlipsByHash(
                                  ...(longFlips.length
                                    ? [longFlips, data]
                                    : [data, longFlips])
                                ),
                            }),
                            log(),
                          ],
                        },
                        onError: {
                          target: 'fetchFlips',
                          actions: log(),
                        },
                      },
                    },
                    fetchFlips: {
                      invoke: {
                        src: 'fetchLongFlips',
                        onDone: [
                          {
                            target: 'enqueueNextFetch',
                            actions: [
                              assign({
                                retries: ({retries}) => retries + 1,
                              }),
                            ],
                            // eslint-disable-next-line no-shadow
                            cond: ({longFlips, validationStart}) =>
                              shouldPollLongFlips(longFlips, {
                                validationStart,
                                shortSessionDuration,
                              }),
                          },
                          {
                            target: 'detectMissing',
                          },
                        ],
                      },
                    },
                    enqueueNextFetch: {
                      after: {
                        5000: 'fetchHashes',
                      },
                    },
                    detectMissing: {
                      on: {
                        '': [
                          {target: 'fetchMissing', cond: 'hasMissingFlips'},
                          {
                            target: 'done',
                          },
                        ],
                      },
                    },
                    fetchMissing: {
                      initial: 'polling',
                      entry: assign({
                        retries: 0,
                      }),
                      states: {
                        polling: {
                          entry: log(
                            ({longFlips}) => missingHashes(longFlips),
                            'fetching missing hashes'
                          ),
                          invoke: {
                            src: ({longFlips}) => cb =>
                              fetchFlips(missingHashes(longFlips), cb),
                            onDone: 'check',
                          },
                        },
                        check: {
                          on: {
                            '': [
                              {target: 'enqueue', cond: 'hasMissingFlips'},
                              {
                                target:
                                  '#validation.longSession.fetch.flips.done',
                              },
                            ],
                          },
                        },
                        enqueue: {
                          // somehow `after` doesn't work here thus custom delay
                          invoke: {
                            src: ({retries}) =>
                              wait(exponentialBackoff(retries) * 1000),
                            onDone: {
                              target: 'polling',
                              actions: assign({
                                retries: ({retries}) => retries + 1,
                              }),
                            },
                          },
                        },
                      },
                    },
                    done: {
                      type: 'final',
                      entry: log(),
                    },
                  },
                  on: {
                    FLIP: {
                      actions: [
                        assign({
                          longFlips: ({longFlips, retries}, {flip}) =>
                            mergeFlipsByHash(longFlips, [{...flip, retries}]),
                        }),
                        log(),
                      ],
                    },
                    REFETCH_FLIPS: {
                      target: '.fetchFlips',
                      actions: [
                        assign({
                          longFlips: ({longFlips}) =>
                            longFlips.map(flip => ({
                              ...flip,
                              fetched: false,
                              decoded: false,
                            })),
                        }),
                        log('Re-fetch long flips after rebooting the app'),
                      ],
                    },
                  },
                  after: {
                    FINALIZE_LONG_FLIPS: {
                      target: '.done',
                      actions: [
                        assign({
                          longFlips: ({longFlips}) =>
                            mergeFlipsByHash(
                              longFlips,
                              longFlips.filter(failedFlip).map(flip => ({
                                ...flip,
                                failed: true,
                              }))
                            ),
                        }),
                        log(),
                      ],
                    },
                  },
                },
                keywords: {
                  initial: 'fetching',
                  states: {
                    fetching: {
                      invoke: {
                        src: ({longFlips}) =>
                          Promise.all(
                            filterReadyFlips(longFlips).map(({hash}) =>
                              fetchWords(hash)
                                .then(({result}) => ({hash, ...result}))
                                .catch(() => ({hash}))
                            )
                          ),
                        onDone: {
                          target:
                            '#validation.longSession.fetch.keywords.success',
                          actions: assign({
                            longFlips: ({longFlips}, {data}) =>
                              mergeFlipsByHash(
                                longFlips,
                                data.map(({hash, words = []}) => ({
                                  hash,
                                  words: words.map(id => ({
                                    id,
                                    ...global.loadKeyword(id),
                                  })),
                                }))
                              ),
                          }),
                        },
                      },
                    },
                    success: {
                      after: {
                        10000: [
                          {
                            target: 'fetching',
                            cond: ({longFlips}) =>
                              longFlips.length === 0 ||
                              filterReadyFlips(longFlips).some(
                                ({words}) => !words || !words.length
                              ),
                          },
                          {
                            target: 'done',
                          },
                        ],
                      },
                    },
                    done: {
                      type: 'final',
                    },
                  },
                },
              },
            },
            solve: {
              type: 'parallel',
              states: {
                nav: {
                  initial: 'firstFlip',
                  states: {
                    // eslint-disable-next-line no-use-before-define
                    firstFlip: stepStates,
                    // eslint-disable-next-line no-use-before-define
                    normal: stepStates,
                    // eslint-disable-next-line no-use-before-define
                    lastFlip: stepStates,
                  },
                  on: {
                    PREV: [
                      {
                        target: undefined,
                        cond: ({longFlips}) => longFlips.length === 0,
                      },
                      {
                        target: '.normal',
                        cond: ({currentIndex}) => currentIndex > 1,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex - 1,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.firstFlip',
                        cond: ({currentIndex}) => currentIndex === 1,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex - 1,
                          }),
                          log(),
                        ],
                      },
                    ],
                    NEXT: [
                      {
                        target: undefined,
                        cond: ({longFlips}) => longFlips.length === 0,
                      },
                      {
                        target: '.lastFlip',
                        cond: ({longFlips, currentIndex}) =>
                          currentIndex === longFlips.length - 2,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex + 1,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.normal',
                        cond: ({longFlips, currentIndex}) =>
                          currentIndex < longFlips.length - 2,
                        actions: [
                          assign({
                            currentIndex: ({currentIndex}) => currentIndex + 1,
                          }),
                          log(),
                        ],
                      },
                    ],
                    PICK: [
                      {
                        target: '.firstFlip',
                        cond: (_, {index}) => index === 0,
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.lastFlip',
                        cond: ({longFlips}, {index}) =>
                          index === longFlips.length - 1,
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                      {
                        target: '.normal',
                        actions: [
                          assign({
                            currentIndex: (_, {index}) => index,
                          }),
                          log(),
                        ],
                      },
                    ],
                  },
                },
                answer: {
                  initial: 'welcomeQualification',
                  states: {
                    welcomeQualification: {
                      on: {
                        START_LONG_SESSION: 'flips',
                      },
                    },
                    flips: {
                      on: {
                        ANSWER: {
                          actions: [
                            assign({
                              longFlips: ({longFlips}, {hash, option}) =>
                                mergeFlipsByHash(longFlips, [{hash, option}]),
                            }),
                            log(),
                          ],
                        },
                        FINISH_FLIPS: {
                          target: 'finishFlips',
                          actions: log(),
                        },
                      },
                    },
                    finishFlips: {
                      on: {
                        START_KEYWORDS_QUALIFICATION: {
                          target: 'keywords',
                          actions: log(),
                        },
                      },
                    },
                    keywords: {
                      invoke: {src: () => cb => cb({type: 'PICK', index: 0})},
                      on: {
                        ANSWER: {
                          actions: [
                            assign({
                              longFlips: ({longFlips}, {hash, option}) =>
                                mergeFlipsByHash(longFlips, [{hash, option}]),
                            }),
                            log(),
                          ],
                        },
                        TOGGLE_WORDS: {
                          actions: [
                            assign({
                              longFlips: ({longFlips}, {hash, relevance}) =>
                                mergeFlipsByHash(longFlips, [
                                  {hash, relevance},
                                ]),
                            }),
                            log(),
                          ],
                        },
                        SUBMIT: {
                          target: 'submitLongSession',
                        },
                      },
                    },
                    submitLongSession: {
                      initial: 'submitting',
                      entry: log(),
                      states: {
                        submitting: {
                          invoke: {
                            // eslint-disable-next-line no-shadow
                            src: ({longFlips, epoch}) =>
                              submitLongAnswers(
                                longFlips.map(
                                  ({option: answer = 0, relevance, hash}) => ({
                                    answer,
                                    wrongWords:
                                      // eslint-disable-next-line no-use-before-define
                                      relevance === RelevanceType.Irrelevant,
                                    hash,
                                  })
                                ),
                                0,
                                epoch
                              ),
                            onDone: {
                              target: '#validation.validationSucceeded',
                            },
                            onError: {
                              target: 'fail',
                              actions: [
                                assign({
                                  errorMessage: (_, {data}) => data,
                                }),
                                log(
                                  (context, event) => ({context, event}),
                                  'Long session submit failed'
                                ),
                              ],
                            },
                          },
                        },
                        fail: {
                          on: {
                            RETRY_SUBMIT: {
                              target: 'submitting',
                            },
                          },
                        },
                      },
                    },
                  },
                  after: {
                    LONG_SESSION_CHECK: [
                      {
                        target: '#validation.validationFailed',
                        cond: ({longFlips}) => {
                          const solvableFlips = filterSolvableFlips(longFlips)
                          const answers = solvableFlips.filter(
                            ({option}) => option
                          )
                          return (
                            !solvableFlips.length ||
                            (solvableFlips.length &&
                              answers.length < solvableFlips.length / 2)
                          )
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          exit: ['cleanupLongFlips'],
        },
        validationFailed: {
          type: 'final',
          entry: log(
            (context, event) => ({context, event}),
            'VALIDATION FAILED'
          ),
        },
        validationSucceeded: {
          type: 'final',
          entry: log('VALIDATION SUCCEEDED'),
        },
      },
    },
    {
      services: {
        fetchShortHashes: () => fetchFlipHashes(SessionType.Short),
        fetchShortFlips: ({shortFlips}) => cb =>
          fetchFlips(
            shortFlips.filter(readyNotFetchedFlip).map(({hash}) => hash),
            cb
          ),
        fetchLongHashes: () => fetchFlipHashes(SessionType.Long),
        fetchLongFlips: ({longFlips}) => cb =>
          fetchFlips(
            longFlips.filter(readyNotFetchedFlip).map(({hash}) => hash),
            cb
          ),
        // eslint-disable-next-line no-shadow
        fetchTranslations: ({longFlips, currentIndex, locale}) =>
          fetchConfirmedKeywordTranslations(
            longFlips[currentIndex].words.map(({id}) => id),
            locale
          ),
      },
      delays: {
        // eslint-disable-next-line no-shadow
        BUMP_EXTRA_FLIPS: ({validationStart}) =>
          Math.max(
            adjustDuration(validationStart, global.env.BUMP_EXTRA_FLIPS || 35),
            5
          ) * 1000,
        // eslint-disable-next-line no-shadow
        FINALIZE_FLIPS: ({validationStart}) =>
          Math.max(
            adjustDuration(validationStart, global.env.FINALIZE_FLIPS || 90),
            5
          ) * 1000,
        // eslint-disable-next-line no-shadow
        SHORT_SESSION_AUTO_SUBMIT: ({validationStart, shortSessionDuration}) =>
          adjustDuration(validationStart, shortSessionDuration - 10) * 1000,
        // eslint-disable-next-line no-shadow
        LONG_SESSION_CHECK: ({validationStart, longSessionDuration}) =>
          adjustDuration(
            validationStart,
            shortSessionDuration - 10 + longSessionDuration
          ) * 1000,
        // eslint-disable-next-line no-shadow
        FINALIZE_LONG_FLIPS: ({validationStart, shortSessionDuration}) =>
          Math.max(
            adjustDuration(
              validationStart,
              shortSessionDuration + (global.env.FINALIZE_LONG_FLIPS || 120)
            ),
            5
          ) * 1000,
      },
      actions: {
        cleanupShortFlips: ({shortFlips}) => {
          filterSolvableFlips(shortFlips).forEach(({images}) =>
            images.forEach(URL.revokeObjectURL)
          )
        },
        cleanupLongFlips: ({longFlips}) => {
          filterSolvableFlips(longFlips).forEach(({images}) =>
            images.forEach(URL.revokeObjectURL)
          )
        },
        applyTranslations: assign({
          translations: ({translations, longFlips, currentIndex}, {data}) =>
            data.reduce((acc, curr, wordIdx) => {
              const currentFlip = longFlips[currentIndex]
              if (currentFlip && currentFlip.words) {
                const {words} = currentFlip
                const word = words[wordIdx]
                return word
                  ? {
                      ...acc,
                      [word.id]: curr,
                    }
                  : acc
              }
              return translations
            }, translations),
        }),
      },
      guards: {
        didFetchShortFlips: ({shortFlips}) => {
          const regularFlips = filterRegularFlips(shortFlips)
          return (
            regularFlips.some(x => x) &&
            regularFlips.every(
              ({ready, fetched, decoded}) => ready && fetched && decoded
            )
          )
        },
        hasMissingFlips: ({longFlips}) => missingHashes(longFlips).length > 0,
        shouldTranslate: ({translations, longFlips, currentIndex}) =>
          shouldTranslate(translations, longFlips[currentIndex]),
      },
    }
  )

function fetchFlips(hashes, cb) {
  global.logger.debug(`Calling flip_get rpc for hashes`, hashes)
  return forEachAsync(hashes, hash =>
    fetchFlip(hash)
      .then(({result, error}) => {
        global.logger.debug(`Get flip_get response`, hash)
        cb({
          type: 'FLIP',
          flip: {
            ...decodeFlip({...result}),
            hash,
            fetched: !!result && !error,
            missing: !!error,
          },
        })
      })
      .catch(() => {
        global.logger.debug(`Catch flip_get reject`, hash)
        cb({
          type: 'FLIP',
          flip: {
            hash,
            fetched: false,
          },
        })
      })
  )
}

function decodeFlip({hash, hex, publicHex, privateHex}) {
  try {
    let images
    let orders

    if (privateHex && privateHex !== '0x') {
      ;[images] = decode(publicHex || hex)
      let privateImages
      ;[privateImages, orders] = decode(privateHex)
      images = images.concat(privateImages)
    } else {
      ;[images, orders] = decode(hex)
    }

    return {
      hash,
      decoded: true,
      images: images.map(buffer =>
        URL.createObjectURL(new Blob([buffer], {type: 'image/png'}))
      ),
      orders: orders.map(order => order.map(([idx = 0]) => idx)),
      hex: '',
    }
  } catch {
    return {
      hash,
      decoded: false,
    }
  }
}

const stepStates = {
  initial: 'unknown',
  states: {
    unknown: {
      on: {
        '': [
          {
            target: 'fetching',
            cond: 'shouldTranslate',
          },
          {target: 'idle'},
        ],
      },
    },
    idle: {},
    fetching: {
      invoke: {
        src: 'fetchTranslations',
        onDone: {
          target: 'idle',
          actions: ['applyTranslations', log()],
        },
        onError: {
          actions: [log()],
        },
      },
    },
  },
}

function mergeFlipsByHash(flips, anotherFlips) {
  return flips.map(flip => ({
    ...flip,
    ...anotherFlips.find(({hash}) => hash === flip.hash),
  }))
}

async function fetchWords(hash) {
  return (
    await apiClient().post('/', {
      method: 'flip_words',
      params: [hash],
      id: 1,
    })
  ).data
}

export const RelevanceType = {
  Relevant: 1,
  Irrelevant: 2,
}

export function adjustDuration(validationStart, duration) {
  return dayjs(validationStart)
    .add(duration, 's')
    .diff(dayjs(), 's')
}
