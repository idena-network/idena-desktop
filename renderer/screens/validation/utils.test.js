import {hasEnoughAnswers, exponentialBackoff} from './utils'

describe('hasEnoughAnswers', () => {
  it('falsy when no answers', () => {
    expect(hasEnoughAnswers([])).toBeFalsy()
  })
  it('falsy when answers are sort of undefineds', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: null},
        {decoded: true, option: undefined},
        {decoded: true},
      ])
    ).toBeFalsy()
  })
  it('truthy when all answered', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true, option: 2},
        {decoded: true, option: 3},
      ])
    ).toBeTruthy()
  })
  it('falsy when there are not enough answers', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true},
        {decoded: true},
      ])
    ).toBeFalsy()
  })
  it('truthy when there are enough answers', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true, option: 1},
        {decoded: true},
      ])
    ).toBeTruthy()
  })
  it('truthy when there are enough answers filtering unsolvables', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: false, option: 1},
        {decoded: false},
      ])
    ).toBeTruthy()
  })
  it('falsy when there are not enough answers filtering unsolvables', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true},
        {decoded: false},
      ])
    ).toBeFalsy()
  })
  it('truthy when exactly 60% answered', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true, option: 1},
        {decoded: true, option: 1},
        {decoded: true},
        {decoded: true},
      ])
    ).toBeTruthy()
  })
  it('falsy when only extra flips are ready', () => {
    expect(
      hasEnoughAnswers([
        {decoded: false},
        {decoded: false},
        {decoded: false},
        {decoded: true, extra: true},
        {decoded: true, extra: true},
      ])
    ).toBeFalsy()
  })
  it('truthy when there are enough answers filtering extras', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: false},
        {decoded: false},
        {decoded: true, extra: true},
        {decoded: true, extra: true},
      ])
    ).toBeTruthy()
  })
  it('falsy when there are not enough answers filtering extras', () => {
    expect(
      hasEnoughAnswers([
        {decoded: true, option: 1},
        {decoded: true},
        {decoded: true},
        {decoded: true, extra: true},
        {decoded: true, extra: true},
      ])
    ).toBeFalsy()
  })
})

describe('exponentialBackoff', () => {
  it('works!', () => {
    ;[0, 1, 2, 3].forEach(n => {
      expect(exponentialBackoff(n)).toBeLessThan(2 ** n + 1)
      expect(exponentialBackoff(n)).toBeGreaterThan(2 ** n)
    })
    expect(exponentialBackoff(10)).toBe(32)
  })
})
