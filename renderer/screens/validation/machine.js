import {Machine, assign, State} from 'xstate'
import {decode} from 'rlp'
import {log} from 'xstate/lib/actions'
import dayjs from 'dayjs'
import {
  fetchFlipHashes,
  submitShortAnswers,
  submitLongAnswers,
} from '../../shared/api/validation'
import {SessionType} from '../../shared/providers/validation-context'
import {fetchFlip} from '../../shared/api'
import apiClient from '../../shared/api/api-client'
import {persistState, loadPersistentState} from '../../shared/utils/persist'
import {EpochPeriod} from '../../shared/providers/epoch-context'
import {canValidate} from '../../shared/providers/identity-context'
import {
  filterRegularFlips,
  filterReadyFlips,
  filterSolvableFlips,
  flipExtraFlip,
  readyNotFetchedFlip,
  availableExtraFlip,
  failedFlip,
  readyFlip,
  hasEnoughAnswers,
  missingHashes,
  exponentialBackoff,
} from './utils'
import {forEachAsync, wait} from '../../shared/utils/fn'

export const createValidationMachine = ({
  epoch,
  validationStart,
  shortSessionDuration,
  longSessionDuration,
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
                      initial: 'fetching',
                      states: {
                        fetching: {
                          entry: log('Fetching long hashes'),
                          invoke: {
                            src: 'fetchLongHashes',
                            onDone: {
                              target:
                                '#validation.longSession.fetch.flips.fetchFlips',
                              actions: [
                                assign({
                                  longFlips: (_, {data}) =>
                                    data.filter(readyFlip),
                                }),
                                log(),
                              ],
                            },
                            onError: {
                              target: 'fail',
                              actions: log(),
                            },
                          },
                        },
                        fail: {},
                      },
                    },
                    fetchFlips: {
                      invoke: {
                        src: 'fetchLongFlips',
                        onDone: {
                          target: 'detectMissing',
                          actions: assign({
                            retries: ({retries}) => retries + 1,
                          }),
                        },
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
                        log('Re-fetching long flips after rebooting app'),
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
                                  words: words.map(global.loadKeyword),
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
                    firstFlip: {},
                    normal: {},
                    lastFlip: {},
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
            longFlips.map(({hash}) => hash),
            cb
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

export function persistValidationState(state) {
  persistState('validation2', state)
}

export function loadValidationState() {
  return loadPersistentState('validation2')
}

export function clearValidationState() {
  persistState('validation2', null)
}

// Here below some guides that just make sense
// You can start validation in any case tho, but it just guarantees 100% failure
//
// Options:
// - Epoch is not fetched or failed, do NOTHING
// - Epoch is fetched but is NOT SHORT SESSION, do NOTHING
// - Epoch is fetched AND is SHORT SESSION BUT NOT VALID IDENTITY do NOTHING
// - Epoch is fetched AND is SHORT SESSION AND IDENTITY IS VALID go further
//
// TODO: add tests you cowards 👊
export function shouldStartValidation(epoch, identity) {
  const isValidationRunning =
    epoch &&
    [EpochPeriod.ShortSession, EpochPeriod.LongSession].includes(
      epoch.currentPeriod
    )

  if (isValidationRunning && canValidate(identity)) {
    // Hooray! We're in but still need to check against persisted validation state and epoch
    const validationStateDefinition = loadValidationState()
    if (validationStateDefinition) {
      const persistedValidationState = State.create(validationStateDefinition)
      const isDone = persistedValidationState.done // is it DONE? any positive or negative, validation-wise

      // One possible way to break this kinda magic case is stucking with node version before the fork
      if (epoch.epoch >= persistedValidationState.context.epoch) {
        const isSameEpoch =
          epoch.epoch === persistedValidationState.context.epoch // is it still SAME epoch?

        if (!isSameEpoch) {
          clearValidationState()
        }
        return !isDone || !isSameEpoch

        // Below cases simplified
        //
        // DONE but NOT SAME EPOCH
        // Validation started in next epoch
        // if (isDone && !isSameEpoch) return true

        // DONE and SAME EPOCH
        // We're done! Keep calm and wait for results
        // if (isDone && isSameEpoch) return false

        // NOT DONE and NOT SAME EPOCH
        // Not finised prev validation. Even more, still in the middle of PREV validation! Not sure it makes sense to proceed, clearing
        // if (!isDone && !isSameEpoch) return true

        // NOT DONE and SAME EPOCH
        // Just bumping persisted state, let's say after restarting the app
        // if (!isDone && isSameEpoch) return true
      }
    } else {
      // Don't have any persisted state, typically means fresh user = 1st validation
      return true
    }
  } else return false
}

export const createTimerMachine = duration =>
  Machine({
    initial: 'running',
    context: {
      elapsed: 0,
      duration,
      interval: 1,
    },
    states: {
      running: {
        entry: assign({
          start: dayjs(),
        }),
        invoke: {
          src: ({interval}) => cb => {
            const intervalId = setInterval(() => cb('TICK'), 1000 * interval)
            return () => clearInterval(intervalId)
          },
        },
        on: {
          '': {
            target: 'stopped',
            // eslint-disable-next-line no-shadow
            cond: ({elapsed, duration}) => elapsed >= duration,
          },
          TICK: {
            actions: assign({
              elapsed: ({start}) => dayjs().diff(start, 's'),
            }),
          },
        },
      },
      stopped: {
        on: {
          '': {
            target: 'running',
            // eslint-disable-next-line no-shadow
            cond: ({elapsed, duration}) => elapsed < duration,
          },
        },
      },
    },
    on: {
      DURATION_UPDATE: {
        actions: assign({
          // eslint-disable-next-line no-shadow
          duration: (_, {duration}) => duration,
        }),
      },
      RESET: {
        actions: assign({
          elapsed: 0,
        }),
      },
    },
  })
