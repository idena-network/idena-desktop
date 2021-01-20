function isHexPrefixed(str) {
  return str.slice(0, 2) === '0x'
}

function stripHexPrefix(str) {
  if (typeof str !== 'string') {
    return str
  }
  return isHexPrefixed(str) ? str.slice(2) : str
}

function intToHex(integer) {
  if (integer < 0) {
    throw new Error('Invalid integer as argument, must be unsigned!')
  }
  const hex = integer.toString(16)
  return hex.length % 2 ? `0${hex}` : hex
}

function padToEven(a) {
  return a.length % 2 ? `0${a}` : a
}

export function bufferToInt(buf) {
  if (!buf || !buf.length) {
    return 0
  }
  return parseInt(Buffer.from(buf).toString('hex'), 16)
}

function intToBuffer(integer) {
  const hex = intToHex(integer)
  return Buffer.from(hex, 'hex')
}

export function toBuffer(v) {
  if (!Buffer.isBuffer(v)) {
    if (typeof v === 'string') {
      if (isHexPrefixed(v)) {
        return Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
      }
      return Buffer.from(v)
    }
    if (typeof v === 'number') {
      if (!v) {
        return Buffer.from([])
      }
      return intToBuffer(v)
    }
    if (v === null || v === undefined) {
      return Buffer.from([])
    }
    if (v instanceof Uint8Array) {
      return Buffer.from(v)
    }
    throw new Error('invalid type')
  }
  return v
}

export function hexToUint8Array(hexString) {
  const str = stripHexPrefix(hexString)

  const arrayBuffer = new Uint8Array(str.length / 2)

  for (let i = 0; i < str.length; i += 2) {
    const byteValue = parseInt(str.substr(i, 2), 16)
    arrayBuffer[i / 2] = byteValue
  }

  return arrayBuffer
}

export function toHexString(byteArray, withPrefix) {
  return (
    (withPrefix ? '0x' : '') +
    Array.from(byteArray, function(byte) {
      // eslint-disable-next-line no-bitwise
      return `0${(byte & 0xff).toString(16)}`.slice(-2)
    }).join('')
  )
}
