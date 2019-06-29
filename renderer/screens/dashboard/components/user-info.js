import React from 'react'
import {rem, margin} from 'polished'
import {SubHeading, Text, Box} from '../../../shared/components'
import theme from '../../../shared/theme'
import Flex from '../../../shared/components/flex'
import Avatar from '../../../shared/components/avatar'
import useUsername from '../../../shared/utils/use-username'
import useFullName from '../../contacts/shared/useFullName'
import {useIdentityState} from '../../../shared/providers/identity-context'

// TODO: THIS IS SHARED COMPONENT!!1 Please move under /shared dir
function UserInfo() {
  const identity = useIdentityState()
  const {address} = identity

  const fullName = useFullName(identity)
  const username = useUsername(identity)

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

export default UserInfo
