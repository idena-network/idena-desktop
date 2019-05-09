import React from 'react'
import PropTypes from 'prop-types'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

function Flip({caption, pics, createdAt}) {
  return (
    <Box m={`${theme.spacings.normal} 0`} w="25%">
      <Box m={`0 0 ${theme.spacings.small}`}>
        <img
          width={150}
          src={fromBlob(pics[0])}
          alt="flip-cover"
          style={{borderRadius: '4px'}}
        />
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text>{caption}</Text>
      </Box>
      <Box m={`0 0 ${theme.spacings.small}`}>
        <Text color={theme.colors.muted}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Box>
    </Box>
  )
}

Flip.propTypes = {
  caption: PropTypes.string.isRequired,
  pics: PropTypes.arrayOf(PropTypes.object).isRequired,
  createdAt: PropTypes.number.isRequired,
}

export default Flip
