import React from 'react'
import PropTypes from 'prop-types'
import {Box, Text} from '.'
import theme from '../theme'

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
