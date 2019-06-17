import React from 'react'
import PropTypes from 'prop-types'
import {rem} from 'polished'
import {SubHeading, Text, Box} from '../../../shared/components'
import theme from '../../../shared/theme'

function UserInfo({nickname, address}) {
  return (
    <Box my={rem(theme.spacings.medium24)}>
      <SubHeading>{nickname || address}</SubHeading>
      <Box>
        <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
          {address}
        </Text>
      </Box>
    </Box>
  )
}

UserInfo.propTypes = {
  nickname: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
}

export default UserInfo
