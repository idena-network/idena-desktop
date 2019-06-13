import React from 'react'
import {Box} from '.'
import theme from '../theme'

// eslint-disable-next-line react/prop-types
function Pre({children}) {
  const content =
    typeof children === 'object' ? JSON.stringify(children) : children

  return (
    <Box bg={theme.colors.gray} p="1em" m="1em 0" w={100}>
      <pre>{content}</pre>
      <style jsx>{`
        pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </Box>
  )
}

export default Pre
