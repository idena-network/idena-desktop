export const useSafe = fn => (...args) => fn && fn(...args)

export const fail = msg => {
  throw new Error(msg)
}

export const failIf = (predicate, msg) => predicate && fail(msg)
