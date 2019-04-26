import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {Box} from '../../shared/components'
import NodeOutput from '../components/log'
import StartButton from '../components/start-button'
import {initialState} from '../types'
import {abToStr} from '../../utils/string'

function NodeStarter({address = '//localhost:9009'}) {
  const [log, setLog] = useState(initialState)

  const onLog = (_, message) => {
    setLog(prevState => ({
      status: 'on',
      log: abToStr(message.log).concat(prevState.log),
    }))
  }

  useEffect(() => {
    global.ipcRenderer.on('node-log', onLog)

    return () => {
      global.ipcRenderer.removeListener('node-log', onLog)
    }
  }, [])

  return (
    <Box>
      <StartButton
        address={address}
        onStart={() => global.ipcRenderer.send('node-log', true)}
      />
      <NodeOutput log={log} />
    </Box>
  )
}

NodeStarter.propTypes = {
  address: PropTypes.string,
}

export default NodeStarter
