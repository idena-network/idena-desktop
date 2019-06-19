import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem, backgrounds, borderRadius} from 'polished'
import theme from '../../../../shared/theme'

function Avatar({username}) {
  return (
    <img
      src={`https://robohash.org/${username}`}
      alt={username}
      width={80}
      style={{
        ...margin(0, rem(theme.spacings.medium24), 0, 0),
        ...backgrounds(theme.colors.gray),
        ...borderRadius('top', 20),
        ...borderRadius('bottom', 20),
      }}
    />
  )
}

Avatar.propTypes = {
  username: PropTypes.string,
}

export default Avatar
