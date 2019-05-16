import React from 'react'
import PropTypes from 'prop-types'

const Convert = import('ansi-to-html')
const convert = new Convert()

const createLogMarkup = log => ({__html: log})

function NodeOutput({log = 'waiting...'}) {
  return (
    <pre
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={createLogMarkup(convert.toHtml(log))}
    >
      <style jsx>{`
        pre {
          height: 200px;
          max-height: 200px;
          max-width: 350px;
          overflow: auto;
          word-break: break-all;
          white-space: pre-line;
        }
      `}</style>
    </pre>
  )
}

NodeOutput.propTypes = {
  log: PropTypes.string,
}

export default NodeOutput
