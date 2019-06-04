import React from 'react'
import PropTypes from 'prop-types'
import {Text} from './typo'
import theme from '../theme'

function Loading({color}) {
  return <Text color={color}>Loading...</Text>
}

Loading.defaultProps = {
  color: theme.colors.white,
}

Loading.propTypes = {
  color: PropTypes.string,
}

export default Loading
