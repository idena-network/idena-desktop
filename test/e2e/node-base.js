/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const flips = require('./flips')

const PORT = 12345

class NodeBase {
  constructor() {
    const server = express()
    server.use(cors())
    server.use(bodyParser.json({limit: '1mb'}))

    this.server = server
    this.sessionStartDate = new Date()
    this.currentPeriod = 'None'

    this._mapMethods()
  }

  result(res, data) {
    return res.status(200).json({
      jsonrpc: '2.0',
      id: 1,
      result: data,
    })
  }

  error(res, err) {
    return res.status(200).json({
      jsonrpc: '2.0',
      id: 1,
      error: err,
    })
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server.listen(PORT, err => {
        if (err) {
          console.log(`> Node error ${err}`)
          reject(err)
        }
        console.log(`> Ready on http://localhost:${PORT}`)
        resolve()
      })
    })
  }

  dna_epoch(req, res) {
    return this.result(res, {
      epoch: 1,
      nextValidation: this.sessionStartDate.toISOString(),
      currentPeriod: this.currentPeriod,
    })
  }

  bcn_syncing(req, res) {
    return this.result(res, {
      syncing: false,
      currentBlock: 1,
      highestBlock: 10000,
    })
  }

  dna_ceremonyIntervals(req, res) {
    return this.result(res, {
      ValidationInterval: 900,
      FlipLotteryDuration: 60,
      ShortSessionDuration: 500,
      LongSessionDuration: 200,
      AfterLongSessionDuration: 60,
    })
  }

  dna_identity(req, res) {
    return this.result(res, {
      address: '0xDe9757E76265Af16691E0ACb818968f52aC6076F',
      nickname: '',
      stake: '123456.4321123',
      invites: 0,
      age: 0,
      state: 'Newbie',
      pubkey: '',
      requiredFlips: 3,
      flipKeyWordPairs: null,
      madeFlips: 3,
      totalQualifiedFlips: 0,
      totalShortFlipPoints: 0,
      flips: ['', '', ''],
      online: true,
      generation: 0,
      code: '0x',
    })
  }

  flip_submitShortAnswers(req, res) {
    return this.result(res, {
      txHash: '0x12',
    })
  }

  flip_submitLongAnswers(req, res) {
    return this.result(res, {
      txHash: '0x12',
    })
  }

  flip_shortHashes(req, res) {
    return this.result(res, [
      {
        hash: '1',
        ready: true,
      },
      {
        hash: '2',
        ready: true,
      },
      {
        hash: '3',
        ready: true,
      },
      {
        hash: '4',
        ready: true,
      },
      {
        hash: '5',
        ready: true,
      },
      {
        hash: '6',
        ready: true,
      },
      {
        hash: '7',
        ready: true,
        extra: true,
      },
      {
        hash: '8',
        ready: true,
        extra: true,
      },
    ])
  }

  flip_longHashes(req, res) {
    return this.result(res, [
      {
        hash: '1',
        ready: true,
      },
      {
        hash: '2',
        ready: true,
      },
      {
        hash: '3',
        ready: true,
      },
      {
        hash: '4',
        ready: true,
      },
      {
        hash: '5',
        ready: true,
      },
      {
        hash: '6',
        ready: true,
      },
      {
        hash: '7',
        ready: true,
      },
      {
        hash: '8',
        ready: true,
      },
      {
        hash: '9',
        ready: true,
      },
      {
        hash: '10',
        ready: true,
      },
      {
        hash: '11',
        ready: true,
      },
      {
        hash: '12',
        ready: true,
      },
      {
        hash: '13',
        ready: true,
      },
      {
        hash: '14',
        ready: true,
      },
      {
        hash: '15',
        ready: true,
      },
    ])
  }

  flip_words(req, res) {
    return this.result(res, {words: [1, 2]})
  }

  flip_get(req, res) {
    const id = req.body.params[0]
    if (flips[id]) {
      return this.result(res, flips[id])
    }
    return this.error('flip is missing')
  }

  _mapMethods() {
    this.server.post('/', (req, res) => {
      if (req.body.method === 'dna_epoch') {
        return this.dna_epoch(req, res)
      }
      if (req.body.method === 'bcn_syncing') {
        return this.bcn_syncing(req, res)
      }
      if (req.body.method === 'dna_ceremonyIntervals') {
        return this.dna_ceremonyIntervals(req, res)
      }
      if (req.body.method === 'dna_identity') {
        return this.dna_identity(req, res)
      }
      if (req.body.method === 'flip_submitShortAnswers') {
        return this.flip_submitShortAnswers(req, res)
      }
      if (req.body.method === 'flip_submitLongAnswers') {
        return this.flip_submitLongAnswers(req, res)
      }
      if (req.body.method === 'flip_shortHashes') {
        return this.flip_shortHashes(req, res)
      }
      if (req.body.method === 'flip_longHashes') {
        return this.flip_longHashes(req, res)
      }
      if (req.body.method === 'flip_words') {
        return this.flip_words(req, res)
      }
      if (req.body.method === 'flip_get') {
        return this.flip_get(req, res)
      }
      return res.status(200).json({
        jsonrpc: '2.0',
        id: 1,
        error: 'method not implemented',
      })
    })
  }
}

module.exports = NodeBase
