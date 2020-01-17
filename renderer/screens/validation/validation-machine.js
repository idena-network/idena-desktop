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
                      shortFlips.some(flip => flip.loaded),
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
              invoke: {
                src: ({shortAnswers, epoch}) =>
                  submitShortAnswers(shortAnswers, 0, epoch),
                onDone: {
                  target: '#longSession',
                },
                onError: {
                  target: 'normal',
                },
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
                  currentIndex < shortFlips.length - 1,
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
          states: {
            decoding: {
              invoke: {
                src: ({longFlips}) => cb => {
                  try {
                    cb({type: 'DECODED', data: longFlips.map(decodeFlip)})
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
              actions: assign({
                longFlips: ({longFlips}, {data}) =>
                  mergeFlipsByHash(longFlips, data),
              }),
            },
            DECODING_FAILED: '.fail',
          },
        },
        solveLongSession: {
          on: {
            ANSWER: {
              actions: assign({
                longAnswers: ({longFlips, currentIndex}, {value}) => [
                  ...longFlips.slice(0, currentIndex),
                  {
                    ...longFlips[currentIndex],
                    option: value,
                  },
                  ...longFlips.slice(currentIndex + 1),
                ],
                currentIndex: ({currentIndex}) => currentIndex + 1,
              }),
            },
            NEXT: {
              actions: assign({
                currentIndex: ({currentIndex}) => currentIndex + 1,
              }),
              cond: ({longFlips, currentIndex}) =>
                currentIndex <= longFlips.length - 1,
            },
            PREV: {
              actions: assign({
                currentIndex: ({currentIndex}) => currentIndex - 1,
              }),
              cond: ({longFlips, currentIndex}) =>
                currentIndex <= longFlips.length - 1,
            },
            PICK: {
              actions: [
                assign({
                  currentIndex: (_, {index}) => index,
                }),
                log(),
              ],
            },
            QUALIFY_WORDS: {
              target: 'qualification',
            },
          },
        },
        qualification: {
          on: {
            TOGGLE_WORDS: {
              actions: assign({
                longAnswers: ({longAnswers, currentIndex}, {value}) => [
                  ...longAnswers.slice(0, currentIndex),
                  {
                    ...longAnswers[currentIndex],
                    reportWords: value,
                  },
                  ...longAnswers.slice(currentIndex + 1),
                ],
              }),
            },
            SUBMIT: {
              invoke: {
                src: ({longAnswers, epoch}) =>
                  submitLongAnswers(longAnswers, 0, epoch),
                onDone: 'validationSucceeded',
              },
            },
          },
        },
      },
    },
    validationSucceeded: {},
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
