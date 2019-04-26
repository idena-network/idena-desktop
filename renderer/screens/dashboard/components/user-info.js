import React from 'react'
import PropTypes from 'prop-types'
import {SubHeading, Text, Box} from '../../../shared/components'
import theme from '../../../shared/theme'

function UserInfo({fullName, address}) {
  return (
    <Box m="0 0 2em">
      <SubHeading>{fullName}</SubHeading>
      <Box>
        <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
          {address}
        </Text>
      </Box>
    </Box>
  )
}

UserInfo.propTypes = {
  fullName: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
}

export default UserInfo
