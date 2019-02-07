import {Component, Fragment} from 'react'
import channels from '../../main/channels'
import {abToStr, bufferToHex} from '../utils/string'
import * as api from '../services/api'
import Convert from 'ansi-to-html'
import FlipDrop from '../components/flips/flip-drop'
import {arrToFormData} from '../utils/api'

const convert = new Convert()

const networkParams = ['address', 'peers', 'balance', 'lastBlock']
const toMethod = p => `get${p[0].toUpperCase()}${p.substr(1)}`

const createLogMarkup = log => ({__html: log})

export default class extends Component {
  state = {
    status: 'off',
    log: '',
    lastBlock: null,
    showDropZone: false,
  }

  componentDidMount() {
    // start listening the channel message
    global.ipcRenderer.on(channels.node, this.handleNodeOutput)
  }

  componentWillUnmount() {
    // stop listening the channel message
    global.ipcRenderer.removeListener(channels.node, this.handleNodeOutput)
  }

  handleNodeOutput = (_event, message) => {
    // receive a message from the main process and save it in the local state
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

  handleUpload = e => {
    e.preventDefault()

    const files = e.target.files || e.dataTransfer.files
    let hex = ''

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.indexOf('image') == 0) {
        const reader = new FileReader()
        reader.addEventListener('load', e => {
          hex += bufferToHex(e.target.result)
          if (i === files.length - 1) {
            console.log(hex)
            // api.submitFlip(hex)
          }
        })
        reader.readAsArrayBuffer(file)
      }
    }
  }

  handleDrop = files => {
    api.submitFlip(arrToFormData(files))
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
                    const caller = api[toMethod(p)]
                    const params = p === 'balance' && this.state.address
                    if (caller) {
                      const resp = await caller(params)
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
        </dl>

        <h2>FLIPs</h2>
        <div
          onDragEnter={() =>
            this.setState({
              showDropZone: true,
            })
          }
          className="flips"
        >
          {this.state.showDropZone && (
            <FlipDrop
              darkMode={false}
              onDrop={this.handleUpload}
              onHide={() => {
                this.setState({showDropZone: false})
              }}
            />
          )}
          Drag and drop your pics here or upload manually{' '}
          <input type="file" onChange={this.handleUpload} />
        </div>

        <style jsx>{`
          main {
            box-sizing: border-box;
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
            height: 200px;
            max-height: 200px;
            overflow: auto;
          }

          .flips {
            position: relative;
            min-height: 350px;
          }
        `}</style>
      </main>
    )
  }
}
