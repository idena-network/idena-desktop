import React from 'react'
import Layout from '../shared/components/layout'
import {Box} from '../shared/components'

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
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
        <Box>{err ? JSON.stringify(err) : 'Weird, no error caught'}</Box>
      </Layout>
    )
  }
}

export default Error
