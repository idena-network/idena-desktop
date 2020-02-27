export const useSafe = fn => (...args) => fn && fn(...args)

export const fail = msg => {
  throw new Error(msg)
}

export const failIf = (predicate, msg) => predicate && fail(msg)

export function forEachAsync(items, fn) {
  return items.reduce(
    (prev, curr) => prev.then(() => fn(curr)),
    Promise.resolve()
  )
}

export const pipeAsync = (...fns) => x =>
  fns.reduce((p, fn) => p.then(fn), Promise.resolve(x))

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
