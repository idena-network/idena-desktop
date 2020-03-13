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
}

module.exports = new Node()
