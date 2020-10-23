const {buildDynamicArgs} = require('./utils')

describe('buildDynamicArgs', () => {
  it('should filter nullish values out', () => {
    expect(
      buildDynamicArgs({value: null}, {value: undefined}, {foo: 'bar'}, {})
    ).toHaveLength(0)
    expect(
      buildDynamicArgs(
        {value: null},
        {value: undefined},
        {foo: ''},
        {value: 0},
        {value: ''},
        {}
      )
    ).toHaveLength(2)
    expect(
      buildDynamicArgs({value: 1}, {value: 2}, {foo: 'bar'}, {})
    ).toHaveLength(2)
    expect(
      buildDynamicArgs({value: 0}, {value: false}, {value: ''}, {})
    ).toHaveLength(3)
  })
})
