export const throwIfSet = fn => (...args) => fn && fn(...args)
