import React, {memo} from 'react'
import PropTypes from 'prop-types'
import {Box, Text} from '../../../shared/components'
import theme from '../../../shared/theme'

const fromBlob = src =>
  URL.createObjectURL(new Blob([src], {type: 'image/jpeg'}))

function Flip({id, caption, pics, createdAt}) {
  return (
    <Box m={`${theme.spacings.normal} 0`} w="25%">
      <Box m={`0 0 ${theme.spacings.small}`}>
        <img
          width={150}
          src={id ? pics[0] : fromBlob(pics[0])}
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
  id: PropTypes.string,
  caption: PropTypes.string.isRequired,
  pics: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  ).isRequired,
  createdAt: PropTypes.number.isRequired,
}

export default memo(Flip)
