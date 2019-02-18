export const useSafe = fn => (...args) => fn && fn(...args)
