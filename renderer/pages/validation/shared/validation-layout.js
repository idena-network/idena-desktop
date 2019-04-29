import React from 'react'
import PropTypes from 'prop-types'
import {Box} from '../../../shared/components'
import Layout from '../../../components/layout'

function ValidationLayout({children}) {
  return (
    <Layout>
      <Box>{children}</Box>
    </Layout>
  )
}

ValidationLayout.propTypes = {
  children: PropTypes.node,
}

export default ValidationLayout
