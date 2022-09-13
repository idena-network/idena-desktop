import {useMachine} from '@xstate/react'
import {assign, createMachine} from 'xstate'

export function useTimer(duration) {
  // eslint-disable-next-line no-use-before-define
  const [state, send] = useMachine(timerMachine, {
    context: {
      duration,
      remaining: duration,
    },
  })

  const {elapsed, remaining} = state.context

  const isStopped = state.matches('stopped')
  const isRunning = state.matches('running')

  return [
    {
      elapsed,
      remaining,
      remainingSeconds: Math.floor(remaining / 1000),
      isRunning,
      isStopped,
      status: state.value,
    },
    {
      // eslint-disable-next-line no-shadow
      reset(duration) {
        send('RESET', {duration})
      },
      stop() {
        send('STOP')
      },
    },
  ]
}

const timerMachine = createMachine({
  context: {
    interval: 1000,
    duration: 0,
    elapsed: 0,
  },
  initial: 'running',
  states: {
    running: {
      always: [
        {
          target: 'stopped',
          cond: ({elapsed, duration}) => elapsed >= duration || duration < 0,
        },
      ],
      entry: [
        assign({
          remaining: ({duration}) => duration,
        }),
      ],
      invoke: {
        src: ({interval}) => cb => {
          const intervalId = setInterval(() => {
            cb('TICK')
          }, interval)

          return () => clearInterval(intervalId)
        },
      },
      on: {
        TICK: {
          actions: [
            assign({
              elapsed: ({elapsed, interval}) => elapsed + interval,
              remaining: ({duration, elapsed, interval}) =>
                duration - elapsed - interval,
            }),
          ],
        },
      },
    },
    stopped: {
      always: {
        target: 'running',
        cond: ({elapsed, duration}) => elapsed < duration,
      },
    },
  },
  on: {
    RESET: {
      actions: [
        assign({
          duration: (_, {duration}) => duration,
          elapsed: 0,
        }),
      ],
    },
    STOP: {
      actions: assign({elapsed: 0}),
    },
  },
})
