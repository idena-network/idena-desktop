import {shouldPersist} from '../utils/persist'

describe('shouldPersist', () => {
  it('truthy if the list has name', () => {
    expect(shouldPersist(['foo'], ['foo'])).toBeTruthy()
    expect(shouldPersist(['foo'], {type: 'foo'})).toBeTruthy()
    expect(shouldPersist(['foo', 'bar', 'foobar'], ['bar'])).toBeTruthy()
    expect(shouldPersist(['foo', 'bar', 'foobar'], {type: 'bar'})).toBeTruthy()
  })
  it('truthy if action passed as string and has name', () => {
    expect(shouldPersist('foo', ['foo'])).toBeTruthy()
    expect(shouldPersist('foo', {type: 'foo'})).toBeTruthy()
  })
  it('falsy if the list doesnt have name', () => {
    expect(shouldPersist(['bar'], ['foo'])).toBeFalsy()
    expect(shouldPersist(['bar'], {type: 'foo'})).toBeFalsy()
    expect(shouldPersist(['bar', 'foobar'], ['foo'])).toBeFalsy()
    expect(shouldPersist(['bar', 'foobar'], {type: 'foo'})).toBeFalsy()
  })
  it('truthy if action passed as string and does not have name', () => {
    expect(shouldPersist('bar', ['foo'])).toBeFalsy()
    expect(shouldPersist('bar', {type: 'foo'})).toBeFalsy()
  })
  it('truthy if the list is falsy', () => {
    expect(shouldPersist([], {type: 'foo'})).toBeTruthy()
    expect(shouldPersist('', {type: 'foo'})).toBeTruthy()
    expect(shouldPersist(undefined, ['foo'])).toBeTruthy()
    expect(shouldPersist(null, ['foo'])).toBeTruthy()
  })
})
