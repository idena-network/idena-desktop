const {HASH_IN_MEMPOOL} = require('./use-tx')

describe('mempool hash', () => {
  it('should have 64 zero-bits', () => {
    expect(HASH_IN_MEMPOOL).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    )
  })
})
