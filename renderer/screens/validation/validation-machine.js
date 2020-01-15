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

async function fetchShortFlips({shortFlips}) {
  return Promise.all(
    shortFlips.map(({hash}) =>
      fetchFlip(hash).then(({result, error}) => ({
        ...result,
        hash,
        loaded: !!result,
        failed: !!error,
      }))
    )
  )
}

async function fetchLongFlips({longFlips}) {
  return Promise.all(
    longFlips.map(({hash}) =>
      fetchFlip(hash).then(({result, error}) => ({
        ...result,
        hash,
        loaded: !!result,
        failed: !!error,
      }))
    )
  )
}

function decodeFlip({hash, hex}) {
  const [images, orders] = decode(hex)
  return {
    hash,
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

export const validationMachine = Machine({
  initial: 'fetchingShortHashes',
  context: {
    shortFlips: [],
    longFlips: [],
    currentIndex: 0,
  },
  states: {
    fetchingShortHashes: {
      initial: 'normal',
      invoke: {
        src: () => fetchFlipHashes(SessionType.Short),
        onDone: {
          target: 'fetchingShortFlips',
          actions: assign({
            shortFlips: (_, {data}) => data,
          }),
        },
        onError: {
          target: '.fail',
        },
      },
      states: {
        normal: {},
        fail: {},
      },
    },
    fetchingShortFlips: {
      initial: 'normal',
      invoke: {
        src: fetchShortFlips,
        onDone: {
          target: 'decodingShortFlips',
          actions: assign({
            shortFlips: ({shortFlips}, {data}) =>
              mergeFlipsByHash(shortFlips, data),
          }),
        },
        onError: {
          target: '.fail',
        },
      },
      states: {
        normal: {},
        fail: {},
      },
    },
    decodingShortFlips: {
      initial: 'normal',
      invoke: {
        src: ({shortFlips}) => cb => {
          try {
            cb({type: 'DECODED', data: shortFlips.map(decodeFlip)})
          } catch (error) {
            cb('DECODING_FAILED')
          }
        },
      },
      on: {
        DECODED: {
          target: 'solvingShortSession',
          actions: assign({
            shortFlips: ({shortFlips}, {data}) =>
              mergeFlipsByHash(shortFlips, data),
          }),
        },
        DECODING_FAILED: {target: '.fail'},
      },
      states: {
        normal: {},
        fail: {},
      },
    },
    solvingShortSession: {
      initial: 'normal',
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
            log(
              (context, event) =>
                `answers: ${context.shortFlips.map(
                  ({option}) => option
                )}, option: ${event.option}`,
              'Answering @ short session'
            ),
          ],
        },
        NEXT: [
          {
            target: '.pickingNextFlip',
            cond: ({currentIndex, shortFlips}) =>
              currentIndex < shortFlips.length - 1,
          },
          {target: '.lastFlip'},
        ],
        PREV: {
          target: '.pickingPrevFlip',
          cond: ({currentIndex}) => currentIndex > 0,
        },
        PICK: {
          actions: assign({
            currentIndex: (_, {index}) => index,
          }),
        },
        SUBMIT: {
          target: 'submittingShortSession',
        },
      },
      states: {
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
      },
    },
    submittingShortSession: {
      invoke: {
        src: ({shortAnswers, epoch}) =>
          submitShortAnswers(shortAnswers, 0, epoch),
        onDone: {
          target: 'fetchLongHashes',
        },
        onError: {
          target: 'validationFailed',
        },
      },
    },
    fetchLongHashes: {
      invoke: {
        src: () => fetchFlipHashes(SessionType.Long),
        onDone: {
          target: 'fetchLongFlips',
          actions: assign({
            longFlips: (_, {data}) => data,
          }),
        },
        onError: {
          target: 'retryLongHashes',
        },
      },
    },
    retryLongHashes: {},
    fetchLongFlips: {
      invoke: {
        src: fetchLongFlips,
        onDone: {
          target: 'decodeLongFlips',
          actions: assign({
            longFlips: ({longFlips}, {data}) =>
              mergeFlipsByHash(longFlips, data),
          }),
        },
        onError: {
          target: 'fetchLongFlipsFailed',
        },
      },
    },
    fetchLongFlipsFailed: {},
    decodeLongFlips: {
      invoke: {
        src: ({longFlips}) => cb => {
          try {
            cb({type: 'DECODED', data: longFlips.map(decodeFlip)})
          } catch (error) {
            cb('DECODING_FAILED')
          }
        },
      },
      on: {
        DECODED: {
          target: 'solvingLongSession',
          actions: assign({
            longFlips: ({longFlips}, {data}) =>
              mergeFlipsByHash(longFlips, data),
          }),
        },
        DECODING_FAILED: 'decodeLongFlipsFailed',
      },
    },
    decodeLongFlipsFailed: {},
    solvingLongSession: {
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
          actions: assign({
            currentIndex: (_, {index}) => index,
          }),
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
              ...longAnswers.slice(0, currentIndex + 1),
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
    validationSucceeded: {},
    validationFailed: {},
  },
})
