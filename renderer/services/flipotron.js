// @ts-check

const defaultCategory = 'story'

const knownTypes = [defaultCategory, 'beforeAfter']

const fail = msg => {
  throw new Error(msg)
}

const failIf = (predicate, msg) => predicate && fail(msg)

const partOf = (slice, whole) =>
  slice.map(x => whole.includes(x)).reduce((agg, curr) => agg && curr, true)

const flatten = arr =>
  'flat' in Array.prototype
    ? arr.flat()
    : arr.reduce((acc, curr) => acc.concat(curr), [])

const Guard = {
  name(type) {
    failIf(
      !knownTypes.includes(type),
      `Unknown type. Please use on of ${knownTypes}`
    )
  },
  flips(flips) {
    failIf(flips.length === 0, 'You must provide at least 1 flip image')
  },
  options(scheme, options) {
    failIf(
      scheme.compare.options.length !== options.length,
      "Options provided don't match scheme definition: options length && ref options"
    )

    const flatArr = flatten(options)
    failIf(
      scheme.compare.useSame
        ? [...new Set(flatArr)].length === flatArr.length
        : [...new Set(flatArr)].length !== flatArr.length,
      "Options provided don't match scheme definition: same && unique"
    )

    failIf(
      !partOf,
      "Options provided don't match scheme definition: no such element"
    )
  },
}

export const schemeDefs = [
  {
    name: 'story',
    flips: [1, 2, 3, 4],
    // TODO: think of the `solver` entity with the `compare` defined as a solver name
    compare: {
      options: [[1, 2, 3, 4], [4, 3, 2, 1]],
      useSame: true,
    },
  },
  {
    name: 'beforeAfter',
    flips: [1, 2],
    compare: {
      options: [[1], [2]],
      useSame: false,
    },
  },
]

/**
 * Action creator for the FLIP
 * @param {Array} flips
 * @param {string} [schemeName]
 * @param {Array.<Array>} [options]
 */
export const createFlip = (
  flips,
  schemeName = defaultCategory,
  options = []
) => {
  Guard.flips(flips)
  Guard.name(schemeName)

  const scheme = schemeDefs.find(scheme => scheme.name === schemeName)

  scheme.flips = flips
  scheme.compare.options = options

  // Guard.options(scheme, options)

  return scheme
}
