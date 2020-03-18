/* eslint-disable camelcase */

const NodeBase = require('../../node-base')

class Node extends NodeBase {
  flip_shortHashes(req, res) {
    return this.result(res, [
      {
        hash: '1',
        ready: true,
      },
      {
        hash: '2',
        ready: false,
      },
      {
        hash: '3',
        ready: false,
      },
      {
        hash: '4',
        ready: true,
        extra: true,
      },
      {
        hash: '5',
        ready: false,
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
        ready: false,
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
        ready: false,
      },
      {
        hash: '6',
        ready: true,
      },
      {
        hash: '7',
        ready: false,
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
    ])
  }
}

module.exports = new Node()
