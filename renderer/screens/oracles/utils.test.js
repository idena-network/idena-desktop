import {TextEncoder, TextDecoder} from 'util'

const {buildDynamicArgs, buildContractDeploymentArgs} = require('./utils')

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

describe('buildDeploymentArgs', () => {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder

  describe('winnerThreshold', () => {
    it('should set default winnerThreshold', () => {
      expect(
        buildContractDeploymentArgs(
          {
            title: 'title',
          },
          {from: '0x0', stake: 100, gasCost: 0, txFee: 0}
        ).args.find(({index}) => index === 4)
      ).toHaveProperty('value', '66')
    })

    it('should not replace 0 with default', () => {
      expect(
        buildContractDeploymentArgs(
          {
            title: 'title',
            winnerThreshold: 0,
          },
          {from: '0x0', stake: 100, gasCost: 0, txFee: 0}
        ).args.find(({index}) => index === 4)
      ).toHaveProperty('value', '0')
    })

    it('should respect valid value', () => {
      ;[10, 22, 33, 51, 65, 77, 99].forEach(v =>
        expect(
          buildContractDeploymentArgs(
            {
              title: 'title',
              winnerThreshold: v,
            },
            {from: '0x0', stake: 100, gasCost: 0, txFee: 0}
          ).args.find(({index}) => index === 4)
        ).toHaveProperty('value', String(v))
      )
    })
  })
})
