import React from 'react'
import PropTypes from 'prop-types'
import theme from '../theme'
import Box from './box'
import {Text} from './typo'

function Group({title, children, addon, ...props}) {
  return (
    <Box>
      <Text color={theme.colors.muted} {...props}>
        {title}
        {addon}
      </Text>
      <Box>{children}</Box>
    </Box>
  )
}

Group.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  addon: PropTypes.node,
}

export default Group
