import React from 'react'
import PropTypes from 'prop-types'
import {margin, backgrounds, borderRadius} from 'polished'
import {useColorMode} from '@chakra-ui/core'
import theme, {rem} from '../theme'

// eslint-disable-next-line react/prop-types
function Avatar({username, size = 80, style}) {
  const {colorMode} = useColorMode()
  const src = username
    ? `https://robohash.org/${username}`
    : 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
  return (
    <img
      src={src}
      alt={username}
      width={size}
      height={size}
      style={{
        ...margin(0, rem(theme.spacings.medium24), 0, 0),
        ...backgrounds(theme.colors[colorMode].gray),
        ...borderRadius('top', 10),
        ...borderRadius('bottom', 10),
        ...style,
      }}
    />
  )
}

Avatar.propTypes = {
  username: PropTypes.string,
  size: PropTypes.number,
}

export default Avatar
