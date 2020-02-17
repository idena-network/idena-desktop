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
  everyFlipFetched,
  filterWaitingForFetching,
  filterWaitingForDecoding,
  filterRegularFlips,
  failedFlips,
  filterReadyFlips,
  filterSolvableFlips,
  flipExtraFlip,
} from './utils'

// TODO: merge fetch and decode flips, move validation services to serializable objects
// TODO: check timerMachine and Timer component correctness, control with timerService/setInterval if needed
export const createValidationMachine = ({
  epoch,
  validationStart,
  shortSessionDuration,
  longSessionDuration,
}) =>
  Machine(
    {
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
      },
      states: {
        shortSession: {
          entry: log('VALIDATION STARTED!'),
          type: 'parallel',
          states: {
            fetch: {
              entry: log('Start fetching short flips'),
              initial: 'check',
              states: {
                check: {
                  entry: log('Check all available flips are fetched'),
                  id: 'check',
                  on: {
                    '': [
                      {
                        target: 'done',
                        cond: ({shortFlips}) => everyFlipFetched(shortFlips),
                      },
                      {
                        target: 'fetchHashes',
                      },
                    ],
                  },
                },
                fetchHashes: {
                  initial: 'fetching',
                  states: {
                    fetching: {
                      entry: log('Fetching short hashes'),
                      invoke: {
                        src: () => fetchFlipHashes(SessionType.Short),
                        onDone: {
                          target: '#fetchShortFlips',
                          actions: [
                            assign({
                              shortFlips: ({shortFlips}, {data}) =>
                                shortFlips.length
                                  ? mergeFlipsByHash(shortFlips, data)
                                  : mergeFlipsByHash(data, shortFlips),
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
                    fail: {
                      after: {
                        1000: 'fetching',
                      },
                    },
                  },
                },
                fetchFlips: {
                  id: 'fetchShortFlips',
                  initial: 'fetching',
                  states: {
                    fetching: {
                      entry: log('Fetching short flips'),
                      invoke: {
                        src: ({shortFlips}) =>
                          fetchFlips(
                            filterWaitingForFetching(shortFlips).map(
                              ({hash}) => hash
                            )
                          ),
                        onDone: {
                          target: '#decodeShortFlips',
                          actions: [
                            assign({
                              shortFlips: ({shortFlips}, {data}) =>
                                mergeFlipsByHash(shortFlips, data),
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
                    fail: {
                      after: {
                        1000: 'fetching',
                      },
                    },
                  },
                },
                decodeFlips: {
                  id: 'decodeShortFlips',
                  initial: 'decoding',
                  states: {
                    decoding: {
                      invoke: {
                        entry: log('Decoding short flips'),
                        src: async ({shortFlips}) =>
                          filterWaitingForDecoding(shortFlips).map(decodeFlip),
                        onDone: {
                          target: 'decoded',
                          actions: [
                            assign({
                              shortFlips: ({shortFlips}, {data}) =>
                                mergeFlipsByHash(shortFlips, data),
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
                    decoded: {
                      after: {
                        1000: '#check',
                      },
                    },
                    fail: {
                      entry: log(),
                    },
                  },
                },
                bumpExtraFlips: {
                  entry: log('bump extra flips'),
                  invoke: {
                    src: ({shortFlips}) => cb => {
                      const availableExtraFlips = shortFlips.filter(
                        ({extra, decoded}) => extra && decoded
                      )
                      if (availableExtraFlips.length) {
                        const replacingFlips = failedFlips(shortFlips)
                        cb({
                          type: 'EXTRA_FLIPS_PULLED',
                          flips:
                            availableExtraFlips.length >= replacingFlips.length
                              ? [
                                  ...replacingFlips.map(flipExtraFlip),
                                  ...availableExtraFlips
                                    .slice(0, replacingFlips.length)
                                    .map(flipExtraFlip),
                                ]
                              : [
                                  ...replacingFlips
                                    .slice(0, availableExtraFlips.length)
                                    .map(flipExtraFlip),
                                  ...replacingFlips
                                    .slice(availableExtraFlips.length)
                                    .map(flip => ({...flip, failed: true})),
                                  ...availableExtraFlips.map(flipExtraFlip),
                                ],
                        })
                      } else {
                        cb('EXTRA_FLIPS_MISSED')
                      }
                    },
                  },
                  on: {
                    EXTRA_FLIPS_PULLED: {
                      target: 'done',
                      actions: [
                        assign({
                          shortFlips: ({shortFlips}, {flips}) =>
                            mergeFlipsByHash(shortFlips, flips),
                        }),
                        log(),
                      ],
                    },
                    EXTRA_FLIPS_MISSED: {
                      target: 'done',
                    },
                  },
                },
                done: {type: 'final'},
              },
              on: {
                REFETCH_FLIPS: {
                  target: '#fetchShortFlips',
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
                  target: '.bumpExtraFlips',
                  cond: ({shortFlips}) => failedFlips(shortFlips).some(x => x),
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
                            cond: ({shortFlips}) => {
                              const solvableFlips = shortFlips.filter(
                                ({decoded, extra}) => decoded && !extra
                              )
                              return (
                                solvableFlips.length &&
                                solvableFlips.filter(({option}) => option)
                                  .length >=
                                  solvableFlips.length / 2
                              )
                            },
                          },
                          {
                            target: '#validationFailed',
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
                              target: '#longSession',
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
          id: 'longSession',
          entry: [
            assign({
              currentIndex: 0,
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
                            src: () => fetchFlipHashes(SessionType.Long),
                            onDone: {
                              target: '#fetchLongFlips',
                              actions: [
                                assign({
                                  longFlips: (_, {data}) => data,
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
                      id: 'fetchLongFlips',
                      initial: 'fetching',
                      states: {
                        fetching: {
                          entry: log('Fetching long flips'),
                          invoke: {
                            src: ({longFlips}) =>
                              fetchFlips(
                                filterReadyFlips(longFlips).map(
                                  ({hash}) => hash
                                )
                              ),
                            onDone: {
                              target: '#decodeLongFlips',
                              actions: [
                                assign({
                                  longFlips: ({longFlips}, {data}) =>
                                    mergeFlipsByHash(longFlips, data),
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
                    decodeFlips: {
                      id: 'decodeLongFlips',
                      initial: 'decoding',
                      states: {
                        decoding: {
                          entry: log('Decoding long flips'),
                          invoke: {
                            src: async ({longFlips}) =>
                              filterWaitingForDecoding(longFlips).map(
                                decodeFlip
                              ),
                            onDone: {
                              target: '#fetchLongFlipsDone',
                              actions: [
                                assign({
                                  longFlips: ({longFlips}, {data}) =>
                                    mergeFlipsByHash(longFlips, data),
                                }),
                                log(),
                              ],
                            },
                          },
                        },
                        fail: {entry: log()},
                      },
                    },
                    done: {
                      id: 'fetchLongFlipsDone',
                      type: 'final',
                      entry: log(),
                    },
                  },
                  on: {
                    REFETCH_FLIPS: {
                      target: '#fetchLongFlips',
                      actions: [
                        assign({
                          longFlips: ({longFlips}) =>
                            longFlips.map(flip => ({
                              ...flip,
                              fetched: false,
                              decoded: false,
                            })),
                        }),
                        log(
                          'Re-fetching long flips after re-entering long session'
                        ),
                      ],
                    },
                  },
                },
                keywords: {
                  initial: 'fetching',
                  states: {
                    fetching: {
                      entry: log('Fetching words'),
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
                          target: '#success',
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
                      id: 'success',
                      entry: log(),
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
                        cond: ({longFlips}) =>
                          filterSolvableFlips(longFlips).length === 0,
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
                        cond: ({longFlips}) =>
                          filterSolvableFlips(longFlips).length === 0,
                      },
                      {
                        target: '.lastFlip',
                        cond: ({longFlips, currentIndex}) =>
                          currentIndex ===
                          filterSolvableFlips(longFlips).length - 2,
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
                          currentIndex <
                          filterSolvableFlips(longFlips).length - 2,
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
                          index === filterSolvableFlips(longFlips).length - 1,
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
                              target: '#validationSucceeded',
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
                        target: '#validationFailed',
                        cond: ({longFlips}) => {
                          const validFlips = filterSolvableFlips(longFlips)
                          const answers = validFlips.filter(
                            ({option}) => option
                          )
                          return (
                            !validFlips.length ||
                            (validFlips.length &&
                              answers.length < validFlips.length / 2)
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
          id: 'validationFailed',
          type: 'final',
          entry: log(
            (context, event) => ({context, event}),
            'VALIDATION FAILED'
          ),
        },
        validationSucceeded: {
          id: 'validationSucceeded',
          type: 'final',
          entry: log('VALIDATION SUCCEEDED'),
        },
      },
    },
    {
      delays: {
        BUMP_EXTRA_FLIPS: 1000 * 35,
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
    }
  )

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

function fetchFlips(hashes) {
  global.logger.debug(`Calling flip_get rpc for hashes`, hashes)
  return Promise.all(
    hashes.map(hash =>
      fetchFlip(hash)
        .then(({result, error}) => {
          global.logger.debug(`Get flip_get response`, hash)
          return {
            ...result,
            hash,
            fetched: !!result && !error,
          }
        })
        .catch(() => {
          global.logger.debug(`Catch flip_get reject`, hash)
          return {
            hash,
            fetched: false,
          }
        })
    )
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
  return (await apiClient().post('/', {
    method: 'flip_words',
    params: [hash],
    id: 1,
  })).data
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
