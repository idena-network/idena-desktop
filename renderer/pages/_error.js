import React from 'react'

import {rem} from 'polished'
import Layout from '../shared/components/layout'
import {Box, Button} from '../shared/components'
import theme from '../shared/theme'

class Error extends React.Component {
  static getInitialProps({res, err}) {
    // eslint-disable-next-line no-nested-ternary
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return {statusCode, err}
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const {statusCode, err} = this.props
    return (
      <Layout>
        <Box p={rem(theme.spacings.medium16)}>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
          <Box>
            <pre>{err ? JSON.stringify(err) : 'Something went wrong'}</pre>
            <Button onClick={() => global.ipcRenderer.send('reload')}>
              Go to My Idena
            </Button>
          </Box>
        </Box>
      </Layout>
    )
  }
}

export default Error
