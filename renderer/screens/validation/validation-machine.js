import {Machine, assign} from 'xstate'
import {decode} from 'rlp'
import {log} from 'xstate/lib/actions'
import {
  fetchFlipHashes,
  submitShortAnswers,
  submitLongAnswers,
} from '../../shared/api/validation'
import {SessionType} from '../../shared/providers/validation-context'
import {fetchFlip} from '../../shared/api'
import apiClient from '../../shared/api/api-client'
import vocabulary from '../flips/utils/words'

export const validationMachine = Machine({
  initial: 'shortSession',
  context: {
    shortFlips: [],
    longFlips: [],
    currentIndex: 0,
  },
  states: {
    shortSession: {
      type: 'parallel',
      after: {
        [1000 * 10]: {
          target: '.retrieveFlips.bumpExtraFlips',
          cond: ({shortFlips}) =>
            shortFlips.some(({loaded, extra}) => !loaded && !extra),
        },
        [1000 * (60 * 2 - 10)]: {
          target: '.solveShortSession.submittingShortSession',
          cond: ({shortFlips}) => {
            const readyFlips = shortFlips.filter(
              ({loaded, decoded}) => loaded && decoded
            )
            return (
              readyFlips.length > 0 &&
              readyFlips.filter(({option}) => !!option).length >=
                readyFlips.length / 2
            )
          },
        },
      },
      states: {
        retrieveFlips: {
          initial: 'checkFlips',
          states: {
            checkFlips: {
              id: 'checkFlips',
              on: {
                '': [
                  {
                    target: 'done',
                    cond: ({shortFlips}) =>
                      shortFlips.length && shortFlips.every(({ready}) => ready),
                  },
                  {
                    target: 'fetchShortHashes',
                  },
                ],
              },
            },
            fetchShortHashes: {
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
            fetchShortFlips: {
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
            decodeShortFlips: {
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
                    1000: '#checkFlips',
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
        solveShortSession: {
          initial: 'waiting',
          states: {
            waiting: {
              on: {
                '': [
                  {
                    target: 'normal',
                    cond: ({shortFlips}) =>
                      shortFlips.some(({loaded, decoded}) => loaded && decoded),
                  },
                ],
              },
            },
            normal: {},
            lastFlip: {},
            pickingNextFlip: {
              entry: assign({
                currentIndex: ({currentIndex}) => currentIndex + 1,
              }),
              on: {
                '': 'normal',
              },
            },
            pickingPrevFlip: {
              entry: assign({
                currentIndex: ({currentIndex}) => currentIndex - 1,
              }),
              on: {
                '': 'normal',
              },
            },
            submittingShortSession: {
              initial: 'normal',
              states: {
                normal: {
                  invoke: {
                    src: ({shortFlips, epoch}) =>
                      submitShortAnswers(
                        shortFlips.map(({option: answer = 0, hash}) => ({
                          answer,
                          hash,
                        })),
                        0,
                        epoch
                      ),
                    onDone: {
                      target: '#longSession',
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
          on: {
            ANSWER: {
              actions: [
                assign({
                  shortFlips: ({shortFlips, currentIndex}, {option}) => [
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
            NEXT: [
              {
                target: '.pickingNextFlip',
                cond: ({currentIndex, shortFlips}) =>
                  currentIndex <
                  shortFlips.filter(({extra}) => !extra).length - 1,
                actions: [log()],
              },
              {target: '.lastFlip'},
            ],
            PREV: {
              target: '.pickingPrevFlip',
              cond: ({currentIndex}) => currentIndex > 0,
              actions: [log()],
            },
            PICK: {
              actions: [
                assign({
                  currentIndex: (_, {index}) => index,
                }),
                log(),
              ],
            },
            SUBMIT: {
              target: '.submittingShortSession',
            },
          },
        },
      },
    },
    longSession: {
      id: 'longSession',
      initial: 'fetchLongHashes',
      entry: assign({
        currentIndex: 0,
      }),
      states: {
        fetchLongHashes: {
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
        fetchLongFlips: {
          id: 'fetchLongFlips',
          initial: 'fetching',
          states: {
            fetching: {
              invoke: {
                src: ({longFlips}) =>
                  fetchFlips(
                    longFlips.filter(({ready}) => ready).map(({hash}) => hash)
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
        decodeLongFlips: {
          id: 'decodeLongFlips',
          initial: 'decoding',
          states: {
            decoding: {
              invoke: {
                src: ({longFlips}) => cb => {
                  try {
                    const flips = longFlips
                      .filter(({loaded, decoded}) => loaded && !decoded)
                      .map(decodeFlip)
                    cb({type: 'DECODED', flips})
                  } catch (error) {
                    cb('DECODING_FAILED')
                  }
                },
              },
            },
            fail: {},
          },
          on: {
            DECODED: {
              target: 'solveLongSession',
              actions: [
                assign({
                  longFlips: ({longFlips}, {flips}) =>
                    mergeFlipsByHash(longFlips, flips),
                }),
                log(),
              ],
            },
            DECODING_FAILED: '.fail',
          },
        },
        solveLongSession: {
          type: 'parallel',
          states: {
            fetchWords: {
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
            solveFlips: {
              initial: 'flips',
              states: {
                flips: {
                  on: {
                    QUALIFY_WORDS: {
                      target: 'qualification',
                    },
                  },
                },
                qualification: {
                  entry: assign({
                    currentIndex: 0,
                  }),
                  on: {
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
                      target: 'submittingLongSession',
                    },
                  },
                },
                submittingLongSession: {
                  initial: 'normal',
                  states: {
                    normal: {
                      invoke: {
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
              on: {
                ANSWER: {
                  actions: assign({
                    longFlips: ({longFlips, currentIndex}, {option}) => [
                      ...longFlips.slice(0, currentIndex),
                      {
                        ...longFlips[currentIndex],
                        option,
                      },
                      ...longFlips.slice(currentIndex + 1),
                    ],
                  }),
                },
                NEXT: {
                  actions: assign({
                    currentIndex: ({currentIndex}) => currentIndex + 1,
                  }),
                  cond: ({longFlips, currentIndex}) =>
                    currentIndex <
                    longFlips.filter(({ready}) => ready).length - 1,
                },
                PREV: {
                  actions: assign({
                    currentIndex: ({currentIndex}) => currentIndex - 1,
                  }),
                  cond: ({currentIndex}) => currentIndex > 0,
                },
                PICK: {
                  actions: [
                    assign({
                      currentIndex: (_, {index}) => index,
                    }),
                    log(),
                  ],
                },
              },
            },
          },
        },
      },
    },
    validationSucceeded: {
      id: 'validationSucceeded',
      type: 'final',
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
    images: images.map(buffer =>
      URL.createObjectURL(new Blob([buffer], {type: 'image/png'}))
    ),
    orders: orders.map(order => order.map(([idx = 0]) => idx)),
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
