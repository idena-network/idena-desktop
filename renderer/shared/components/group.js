import React from 'react'
import PropTypes from 'prop-types'
import {Box, Text} from '.'
import theme from '../../theme'

function Group({title, children}) {
  return (
    <Box>
      <Text color={theme.colors.muted}>{title}</Text>
      <Box>{children}</Box>
    </Box>
  )
}

Group.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
}

export default Group
