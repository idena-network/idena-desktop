import {Component, Fragment} from 'react'
import channels from '../../main/channels'
import {ab2str} from '../utils/string'
import * as api from '../services/api'
import Convert from 'ansi-to-html'
// import {startNode} from '../../main/idenaNode'

const convert = new Convert()

const networkParams = ['address', 'peers', 'balance', 'lastBlock']
const toMethod = p => `get${p[0].toUpperCase()}${p.substr(1)}`

const createLogMarkup = log => ({__html: log})

export default class extends Component {
  state = {
    status: 'off',
    log: '',
    lastBlock: null,
  }

  componentDidMount() {
    // start listening the channel message
    global.ipcRenderer.on(channels.node, this.handleNodeOutput)
  }

  componentWillUnmount() {
    // stop listening the channel message
    global.ipcRenderer.removeListener(channels.node, this.handleNodeOutput)
  }

  handleNodeOutput = (event, message) => {
    // receive a message from the main process and save it in the local state
    this.setState(({log}) => ({
      status: 'on',
      log: ab2str(message.log).concat(log),
    }))
  }

  handleStartNode = event => {
    if (this.state.status !== 'on') {
      global.ipcRenderer.send(channels.node, 'start')
    }
  }

  render() {
    return (
      <main>
        <h1>
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

        <b>Network</b>
        <dl>
          {networkParams.map(p => (
            <Fragment key={p}>
              <dt>
                {p}{' '}
                <a
                  key={p}
                  href="#"
                  onClick={async () => {
                    const caller = api[toMethod(p)]
                    const params =
                      p === 'balance' && this.state.address
                        ? JSON.parse(this.state.address)
                        : undefined
                    if (caller) {
                      const resp = await caller(params)
                      this.setState({
                        [p]: JSON.stringify(resp) || '💩',
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
        </dl>

        <style jsx>{`
          main {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial,
              sans-serif;
            font-size: 12px;
          }
          h1 {
            font-size: 1.6em;
          }
          .status {
            border-radius: 50%;
            display: inline-block;
            height: 1em;
            width: 1em;
            margin: 0 0.2em;
            vertical-align: middle;
          }
          .on {
            background: green;
          }
          .off {
            background: red;
            cursor: pointer;
          }
          pre {
            height: 300px;
            max-height: 300px;
            overflow: auto;
          }
        `}</style>
      </main>
    )
  }
}
