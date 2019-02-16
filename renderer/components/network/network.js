import React, { Component } from "react";

import channels from '../../main/channels'
import * as api from '../services/api'
import {abToStr, capitalize} from '../utils/string'

const convert = new Convert()

const networkParams = ['address', 'peers', 'balance', 'lastBlock']
const toRpc = p => `get${capitalize(p)}`

const createLogMarkup = log => ({__html: log})

class Network extends Component {
  state = {
    status: 'off',
    log: '',
    lastBlock: null,
  }

  componentDidMount() {
    global.ipcRenderer.on(channels.node, this.handleNodeOutput)
  }

  componentWillUnmount() {
    global.ipcRenderer.removeListener(channels.node, this.handleNodeOutput)
  }

  handleNodeOutput = (_event, message) => {
    this.setState(({log}) => ({
      status: 'on',
      log: abToStr(message.log).concat(log),
    }))
  }

  handleStartNode = () => {
    if (this.state.status !== 'on') {
      global.ipcRenderer.send(channels.node, 'start')
    }
  }

  render() {
    return (<h1>
    Idena{' '}
    <span
      onClick={this.handleStartNode}
      className={`status ${this.state.status}`}
    />
  </h1>
  <pre
    dangerouslySetInnerHTML={createLogMarkup(
      convert.toHtml(this.state.log) || 'waiting for logs...'
    )}
  />

  <h2>Network</h2>
  <dl>
    {networkParams.map(p => (
      <Fragment key={p}>
        <dt>
          {p}{' '}
          <a
            key={p}
            href="#"
            onClick={async () => {
              const callee = api[toRpc(p)]
              const params = p === 'balance' && this.state.address
              if (callee) {
                const resp = await callee(params)
                this.setState({
                  [p]:
                    (typeof resp === 'object'
                      ? JSON.stringify(resp)
                      : resp) || '💩',
                })
              }
            }}
          >
            fetch
          </a>
        </dt>
        <dd>{this.state[p]}</dd>
      </Fragment>
    ))}
  </dl>)
  }
}