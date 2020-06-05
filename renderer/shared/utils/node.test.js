import {isHardFork} from './node'

describe('isHardFork', () => {
  it('respects major version', () => {
    expect(isHardFork('0.0.0', '0.0.0')).toBeFalsy()
    expect(isHardFork('0.1.0', '0.1.0')).toBeFalsy()
    expect(isHardFork('0.1.0', '0.1.1')).toBeFalsy()

    expect(isHardFork('0.1.0', '0.2.0')).toBeTruthy()
    expect(isHardFork('0.1.0', '0.2.2')).toBeTruthy()
    expect(isHardFork('0.1.0', '0.3.0')).toBeTruthy()
    expect(isHardFork('0.1.0', '1.0.0')).toBeTruthy()
  })

  it('handles edge cases', () => {
    expect(isHardFork('0.1.0', '0.2.0-rc')).toBeFalsy()
    expect(isHardFork('0.1.0', '0.2.0-beta')).toBeFalsy()
    expect(isHardFork('0.1.0foo', '0.2.0bar')).toBeFalsy()
    expect(isHardFork('not a', 'semver string')).toBeFalsy()
  })
})
