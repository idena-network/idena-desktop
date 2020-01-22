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
import vocabulary from '../flips/utils/words'
import {persistState, loadState} from '../../shared/utils/persist'
import {EpochPeriod} from '../../shared/providers/epoch-context'
import {canValidate} from '../../shared/providers/identity-context'

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
      },
      states: {
        shortSession: {
          entry: log('VALIDATION STARTED!'),
          type: 'parallel',
          states: {
            fetch: {
              initial: 'check',
              states: {
                check: {
                  id: 'check',
                  on: {
                    '': [
                      {
                        target: 'done',
                        cond: ({shortFlips}) =>
                          shortFlips.length &&
                          shortFlips.every(({ready}) => ready),
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
                          ],
                        },
                        onError: {
                          target: 'fail',
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
                      invoke: {
                        src: ({shortFlips}) =>
                          fetchFlips(
                            shortFlips
                              .filter(({ready, loaded}) => ready && !loaded)
                              .map(({hash}) => hash)
                          ),
                        onDone: {
                          target: '#decodeShortFlips',
                          actions: assign({
                            shortFlips: ({shortFlips}, {data}) =>
                              mergeFlipsByHash(shortFlips, data),
                          }),
                        },
                        onError: {
                          target: 'fail',
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
                        src: async ({shortFlips}) =>
                          shortFlips
                            .filter(({loaded, decoded}) => loaded && !decoded)
                            .map(decodeFlip),
                        onDone: {
                          target: 'decoded',
                          actions: [
                            assign({
                              shortFlips: ({shortFlips}, {data}) =>
                                mergeFlipsByHash(shortFlips, data),
                            }),
                          ],
                        },
                        onError: {
                          target: 'fail',
                        },
                      },
                    },
                    decoded: {
                      after: {
                        1000: '#check',
                      },
                    },
                    fail: {},
                  },
                },
                bumpExtraFlips: {
                  invoke: {
                    src: ({shortFlips}) => cb => {
                      let neededExtraFlipsCount = shortFlips.filter(
                        ({loaded, extra}) => !loaded && !extra
                      ).length
                      let pulledExtraFlipsCount = 0

                      const flips = shortFlips.map(flip => {
                        if (!flip.extra) return flip

                        const shouldBecomeAvailable =
                          flip.loaded && neededExtraFlipsCount > 0
                        neededExtraFlipsCount -= 1
                        pulledExtraFlipsCount += 1

                        return {
                          ...flip,
                          extra: !shouldBecomeAvailable,
                        }
                      })

                      for (let i = flips.length - 1; i >= 0; i -= 1) {
                        if (
                          pulledExtraFlipsCount > 0 &&
                          (!flips[i].loaded || flips[i].failed)
                        ) {
                          pulledExtraFlipsCount -= 1
                          flips[i].extra = true
                        }
                      }
                      cb({type: 'EXTRA_FLIPS_PULLED', flips})
                      return flips
                    },
                  },
                  on: {
                    EXTRA_FLIPS_PULLED: {
                      target: 'done',
                      actions: assign({
                        shortFlips: (_, {flips}) => flips,
                      }),
                    },
                  },
                },
                done: {type: 'final'},
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
                          shortFlips.filter(
                            ({loaded, decoded}) => loaded && decoded
                          ).length === 0,
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
                          shortFlips.filter(
                            ({loaded, decoded}) => loaded && decoded
                          ).length === 0,
                      },
                      {
                        target: '.lastFlip',
                        cond: ({currentIndex, shortFlips}) =>
                          currentIndex ===
                          shortFlips.filter(({extra}) => !extra).length - 2,
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
                          shortFlips.filter(({extra}) => !extra).length - 2,
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
                          index ===
                          shortFlips.filter(({extra}) => !extra).length - 1,
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
                              shortFlips: (
                                {shortFlips, currentIndex},
                                {option}
                              ) => [
                                ...shortFlips.slice(0, currentIndex),
                                {
                                  ...shortFlips[currentIndex],
                                  option,
                                },
                                ...shortFlips.slice(currentIndex + 1),
                              ],
                            }),
                            log(),
                          ],
                        },
                        SUBMIT: {
                          target: 'submitShortSession',
                        },
                      },
                    },
                    submitShortSession: {
                      initial: 'submitting',
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
                              target: 'done',
                            },
                            onError: {
                              target: 'fail',
                            },
                          },
                        },
                        done: {
                          on: {
                            START_LONG_SESSION: '#longSession',
                          },
                        },
                        fail: {},
                      },
                    },
                  },
                },
              },
            },
          },
          after: {
            BUMP_EXTRA_FLIPS: {
              target: '.fetch.bumpExtraFlips',
              cond: ({shortFlips}) =>
                shortFlips.some(({ready, extra}) => !ready && !extra),
            },
            SHORT_SESSION_AUTO_SUBMIT: [
              {
                target: '.solve.answer.submitShortSession',
                cond: ({shortFlips}) => {
                  const readyFlips = shortFlips.filter(({ready}) => ready)
                  return (
                    readyFlips.length > 0 &&
                    readyFlips.filter(({option}) => option).length >=
                      readyFlips.length / 2
                  )
                },
              },
              {
                target: 'validationFailed',
              },
            ],
          },
        },
        longSession: {
          id: 'longSession',
          entry: assign({
            currentIndex: 0,
          }),
          type: 'parallel',
          states: {
            fetch: {
              type: 'parallel',
              states: {
                flips: {
                  initial: 'fetchHashes',
                  states: {
                    fetchHashes: {
                      initial: 'fetching',
                      states: {
                        fetching: {
                          invoke: {
                            src: () => fetchFlipHashes(SessionType.Long),
                            onDone: {
                              target: '#fetchLongFlips',
                              actions: assign({
                                longFlips: (_, {data}) => data,
                              }),
                            },
                            onError: 'fail',
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
                          invoke: {
                            src: ({longFlips}) =>
                              fetchFlips(
                                longFlips
                                  .filter(({ready}) => ready)
                                  .map(({hash}) => hash)
                              ),
                            onDone: {
                              target: '#decodeLongFlips',
                              actions: assign({
                                longFlips: ({longFlips}, {data}) =>
                                  mergeFlipsByHash(longFlips, data),
                              }),
                            },
                            onError: 'fail',
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
                          invoke: {
                            src: async ({longFlips}) =>
                              longFlips
                                .filter(
                                  ({loaded, decoded}) => loaded && !decoded
                                )
                                .map(decodeFlip),
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
                        fail: {},
                      },
                    },
                    done: {
                      id: 'fetchLongFlipsDone',
                      type: 'final',
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
                            longFlips
                              .filter(({ready}) => ready)
                              .map(({hash}) =>
                                fetchWords(hash)
                                  .then(({result}) => ({hash, ...result}))
                                  .catch(() => {})
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
                                  words: words.map(idx => vocabulary[idx]),
                                }))
                              ),
                          }),
                        },
                      },
                    },
                    suceess: {
                      id: 'success',
                      after: {
                        1000: [
                          {
                            target: 'fetching',
                            cond: ({longFlips}) =>
                              longFlips
                                .filter(({ready}) => ready)
                                .some(({words}) => !words),
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
                          longFlips.filter(
                            ({loaded, decoded}) => loaded && decoded
                          ).length === 0,
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
                          longFlips.filter(
                            ({loaded, decoded}) => loaded && decoded
                          ).length === 0,
                      },
                      {
                        target: '.lastFlip',
                        cond: ({longFlips, currentIndex}) =>
                          currentIndex ===
                          longFlips.filter(({ready}) => ready).length - 2,
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
                          longFlips.filter(({ready}) => ready).length - 2,
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
                          index ===
                          longFlips.filter(({ready}) => ready).length - 1,
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
                  initial: 'flips',
                  states: {
                    flips: {
                      on: {
                        ANSWER: {
                          actions: [
                            assign({
                              longFlips: (
                                {longFlips, currentIndex},
                                {option}
                              ) => [
                                ...longFlips.slice(0, currentIndex),
                                {
                                  ...longFlips[currentIndex],
                                  option,
                                },
                                ...longFlips.slice(currentIndex + 1),
                              ],
                            }),
                            log(),
                          ],
                        },
                        FINISH_FLIPS: {
                          target: 'finishFlips',
                        },
                      },
                    },
                    finishFlips: {
                      on: {
                        START_KEYWORDS_QUALIFICATION: {
                          target: 'keywords',
                        },
                      },
                    },
                    keywords: {
                      invoke: {src: () => cb => cb({type: 'PICK', index: 0})},
                      on: {
                        ANSWER: {
                          actions: [
                            assign({
                              longFlips: (
                                {longFlips, currentIndex},
                                {option}
                              ) => [
                                ...longFlips.slice(0, currentIndex),
                                {
                                  ...longFlips[currentIndex],
                                  option,
                                },
                                ...longFlips.slice(currentIndex + 1),
                              ],
                            }),
                            log(),
                          ],
                        },
                        TOGGLE_WORDS: {
                          actions: [
                            assign({
                              longFlips: (
                                {longFlips, currentIndex},
                                {relevance}
                              ) => [
                                ...longFlips.slice(0, currentIndex),
                                {
                                  ...longFlips[currentIndex],
                                  relevance,
                                },
                                ...longFlips.slice(currentIndex + 1),
                              ],
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
                            },
                          },
                        },
                        fail: {},
                      },
                    },
                  },
                },
              },
            },
          },
          after: {
            LONG_SESSION_CHECK: [
              {
                target: 'validationFailed',
                cond: ({longFlips}) => {
                  const readyFlips = longFlips.filter(({ready}) => ready)
                  return (
                    readyFlips.filter(({option}) => option).length <
                    readyFlips.length / 2
                  )
                },
              },
            ],
          },
        },
        validationFailed: {
          id: 'validationFailed',
          type: 'final',
          entry: log('VALIDATION FAILED'),
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
            shortSessionDuration + longSessionDuration
          ) * 1000,
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
              elapsed: ({elapsed, interval}) => elapsed + interval,
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
  return Promise.all(
    hashes.map(hash =>
      fetchFlip(hash)
        .then(({result, error}) => ({
          ...result,
          hash,
          loaded: !!result,
          failed: !!error,
        }))
        .catch(() => ({
          hash,
          loaded: false,
          failed: true,
        }))
    )
  )
}

function decodeFlip({hash, hex}) {
  const [images, orders] = decode(hex)
  return {
    hash,
    decoded: true,
    images: images.map(
      buffer => `data:image/png;base64,${buffer.toString('base64')}`
      // buffer => URL.createObjectURL(new Blob([buffer], {type: 'image/png'}))
    ),
    orders: orders.map(order => order.map(([idx = 0]) => idx)),
    hex: '',
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
  return loadState('validation2')
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
  const isShortSession =
    epoch && epoch.currentPeriod === EpochPeriod.ShortSession

  if (isShortSession && canValidate(identity)) {
    // Hooray! We're in but still need to check against persisted validation state and epoch
    const validationStateDefinition = loadValidationState()
    if (validationStateDefinition) {
      const persistedValidationState = State.create(validationStateDefinition)
      const isDone = persistedValidationState.done // is it DONE? any positive or negative

      // One possible way to break this kinda magic case is stucking with node version before the fork
      if (epoch.epoch >= persistedValidationState.context.epoch) {
        const isSameEpoch =
          epoch.epoch === persistedValidationState.context.epoch // is it still SAME epoch?

        if (!isSameEpoch) {
          clearValidationState()
          return isDone
        }
        return !isDone

        // Below cases simplified
        //
        // DONE but NOT SAME EPOCH
        // Validation started in next epoch
        // if (isDone && !isSameEpoch) return true

        // DONE and SAME EPOCH
        // We're done! Keep calm and wait for results
        // if (isDone && isSameEpoch) return

        // NOT DONE and NOT SAME EPOCH
        // Not finised prev validation. Even more, still in the middle of PREV validation! Not sure it makes sense to proceed, clearing
        // if (!isDone && !isSameEpoch) return false

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
