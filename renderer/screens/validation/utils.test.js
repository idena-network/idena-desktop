import {byId, merge, mergeById} from '../../shared/utils/utils'
import {hasEnoughAnswers, exponentialBackoff, shouldTranslate} from './utils'

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
    ;[0, 1, 2, 3].forEach((n) => {
      expect(exponentialBackoff(n)).toBeLessThan(2 ** n + 1)
      expect(exponentialBackoff(n)).toBeGreaterThan(2 ** n)
    })
    expect(exponentialBackoff(10)).toBe(32)
  })
})

describe('shouldTranslate', () => {
  it('should not translate if both words have been translated already', () => {
    expect(
      shouldTranslate(
        {
          1: [{id: 10001, name: 't10001'}],
          2: [{id: 10001, name: 't10001'}],
        },
        {
          words: [
            {id: 1, name: '1'},
            {id: 2, name: '2'},
          ],
        }
      )
    ).toBeFalsy()
  })

  it('should not translate if words are nullish', () => {
    ;[{words: {}}, {words: []}, {words: null}, {words: undefined}].forEach(
      (flip) => expect(shouldTranslate(null, flip)).toBeFalsy()
    )
  })

  it('should translate if some word has missing translation, or both', () => {
    const flip = {
      words: [
        {id: 1, name: '1'},
        {id: 2, name: '2'},
      ],
    }
    expect(
      shouldTranslate(
        {
          1: [{id: 10001, name: 't10001'}],
        },
        flip
      )
    ).toBeTruthy()

    expect(shouldTranslate({}, flip)).toBeTruthy()

    expect(shouldTranslate({1: null}, flip)).toBeTruthy()

    expect(
      shouldTranslate(
        {
          1: null,
          2: undefined,
        },
        flip
      )
    ).toBeTruthy()
  })
})

describe('merge', () => {
  it('should merge multilple arrays consider predicate given', () => {
    const a = [
      {id: 1, name: 'a', foo: 'bar'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
    ]
    const b = [
      {id: 1, name: 'aa'},
      {id: 2, name: 'bb'},
      {id: 3, name: 'cc'},
    ]
    const c = [
      {id: 1, name: 'aaa'},
      {id: 2, name: 'bbb', foobar: 'foobar'},
      {id: 3, name: 'ccc'},
    ]
    const d = [
      {id: 1, name: 'aaaa', bar: 'foo'},
      {id: 2, name: 'bbbb'},
      {id: 3, name: 'cccc'},
    ]

    const merged = merge(byId)(a, b, c, d)

    expect(merged).toStrictEqual([
      {id: 1, name: 'aaaa', foo: 'bar', bar: 'foo'},
      {id: 2, name: 'bbbb', foobar: 'foobar'},
      {id: 3, name: 'cccc'},
    ])

    expect(
      merge(
        (x) =>
          ({hash}) =>
            hash === x.hash
      )(
        [{hash: 'a', foo: 'foo'}, {hash: 'b'}, {hash: 'c'}],
        [{hash: 'a', bar: 'bar'}, {hash: 'b'}, {hash: 'c'}],
        [{hash: 'a', foobar: 'foobar'}, {hash: 'b'}, {hash: 'c'}]
      )
    ).toStrictEqual([
      {hash: 'a', foo: 'foo', bar: 'bar', foobar: 'foobar'},
      {hash: 'b'},
      {hash: 'c'},
    ])
  })

  test('should handle empty array', () => {
    expect(
      mergeById(
        [],
        [
          {id: 1, name: 'a', foo: 'foo'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
        ],
        [
          {id: 1, name: 'a', bar: 'bar'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
        ]
      )
    ).toStrictEqual([
      {id: 1, name: 'a', foo: 'foo', bar: 'bar'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
    ])

    expect(
      mergeById(
        [
          {id: 1, name: 'a', foo: 'foo'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
        ],
        [],
        [
          {id: 1, name: 'a', bar: 'bar'},
          {id: 2, name: 'b'},
          {id: 3, name: 'c'},
        ]
      )
    ).toStrictEqual([
      {id: 1, name: 'a', foo: 'foo', bar: 'bar'},
      {id: 2, name: 'b'},
      {id: 3, name: 'c'},
    ])
  })
})
