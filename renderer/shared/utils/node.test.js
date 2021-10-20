import {isFork} from './node'

describe('isFork', () => {
  it('respects major version', () => {
    expect(isFork('0.0.0', '0.0.0')).toBeFalsy()
    expect(isFork('0.1.0', '0.1.0')).toBeFalsy()
    expect(isFork('0.1.0', '0.1.1')).toBeFalsy()

    expect(isFork('0.1.0', '0.2.0')).toBeTruthy()
    expect(isFork('0.1.0', '0.2.2')).toBeTruthy()
    expect(isFork('0.1.0', '0.3.0')).toBeTruthy()
    expect(isFork('0.1.0', '1.0.0')).toBeTruthy()
  })

  it('handles edge cases', () => {
    expect(isFork('0.1.0', '0.2.0-rc')).toBeFalsy()
    expect(isFork('0.1.0', '0.2.0-beta')).toBeFalsy()
    expect(isFork('0.1.0foo', '0.2.0bar')).toBeFalsy()
    expect(isFork('not a', 'semver string')).toBeFalsy()
  })
})
