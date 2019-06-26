import React from 'react'
import PropTypes from 'prop-types'
import {rem, margin} from 'polished'
import {SubHeading, Text, Box} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Avatar from '../../flips/shared/components/avatar'
import useUsername from '../../../shared/utils/use-username'
import useFullName from '../../contacts/shared/useFullName'

function UserInfo(props) {
  const {address} = props
  const fullName = useFullName(props)
  const username = useUsername(props)
  return (
    <Flex
      align="center"
      css={{
        ...margin(rem(theme.spacings.medium24), 0),
      }}
    >
      <Avatar username={username} />
      <Box my={rem(theme.spacings.medium24)}>
        <SubHeading>{fullName || username}</SubHeading>
        <Box>
          <Text color={theme.colors.muted} css={{wordBreak: 'break-all'}}>
            {address}
          </Text>
        </Box>
      </Box>
    </Flex>
  )
}

UserInfo.propTypes = {
  address: PropTypes.string.isRequired,
}

export default UserInfo
