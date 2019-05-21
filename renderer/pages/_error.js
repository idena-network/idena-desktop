import React from 'react'

class Error extends React.Component {
  static getInitialProps({res, err}) {
    // eslint-disable-next-line no-nested-ternary
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return {statusCode}
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const {statusCode} = this.props
    return (
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    )
  }
}

export default Error
