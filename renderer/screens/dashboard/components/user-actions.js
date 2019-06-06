import React from 'react'
import PropTypes from 'prop-types'
import {FiShare, FiUserPlus, FiCamera} from 'react-icons/fi'
import {Link} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import IconLink from '../../../shared/components/icon-link'

export function UserActions({onToggleSendInvite}) {
  return (
    <Flex>
      <IconLink icon={<FiShare />} first>
        Share
      </IconLink>
      <IconLink icon={<FiUserPlus />} onClick={onToggleSendInvite}>
        Invite
      </IconLink>
      <Link href="/flips/new">
        <IconLink icon={<FiCamera />}>Submit flip</IconLink>
      </Link>
    </Flex>
  )
}

UserActions.propTypes = {
  onToggleSendInvite: PropTypes.func,
}

export default UserActions
