export const abToStr = ab => new TextDecoder('utf-8').decode(ab)

export const bufferToHex = buffer => {
  let s = ''
  const h = '0123456789ABCDEF'
  new Uint8Array(buffer).forEach(v => {
    s += h[v >> 4] + h[v & 15]
  })
  return s
}
