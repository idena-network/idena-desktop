import React from 'react'
import PropTypes from 'prop-types'
import {FiShare, FiUserPlus, FiCamera} from 'react-icons/fi'
import {Link} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import IconLink from '../../../shared/components/icon-link'
import Divider from '../../../shared/components/divider'

export function UserActions({onSendInvite}) {
  return (
    <Flex>
      <IconLink icon={<FiShare />}>Share</IconLink>
      <Divider vertical />
      <IconLink icon={<FiUserPlus />} onClick={onSendInvite}>
        Invite
      </IconLink>
      <Divider vertical />
      <Link href="/flips/new">
        <IconLink icon={<FiCamera />}>Submit flip</IconLink>
      </Link>
    </Flex>
  )
}

UserActions.propTypes = {
  onSendInvite: PropTypes.func,
}

export default UserActions
