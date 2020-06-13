export const bufferToHex = buffer => {
  let s = ''
  const h = '0123456789ABCDEF'
  new Uint8Array(buffer).forEach(v => {
    // eslint-disable-next-line no-bitwise
    s += h[v >> 4] + h[v & 15]
  })
  return `0x${s}`
}

export const capitalize = str => str[0].toUpperCase() + str.substr(1)

export function pluralize(word, num) {
  return num > 1 ? `${word}s` : word
}
