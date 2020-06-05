import {Machine, assign} from 'xstate'
import dayjs from 'dayjs'

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
