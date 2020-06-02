export function forEachAsync(items, fn) {
  return items.reduce(
    (prev, curr) => prev.then(() => fn(curr)),
    Promise.resolve()
  )
}

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
