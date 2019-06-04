import React from 'react'
import PropTypes from 'prop-types'
import {FiShare, FiUserPlus, FiCamera} from 'react-icons/fi'
import theme from '../../../shared/theme'
import {Link} from '../../../shared/components'
import Flex from '../../../shared/components/flex'

// eslint-disable-next-line react/prop-types
const IconLink = ({icon, children, first, last, ...props}) => (
  <button type="button" {...props}>
    {icon}
    <span>{children}</span>
    <style jsx>{`
      button {
        background: none;
        border: none;
        color: ${theme.colors.primary};
        cursor: pointer;
        font-size: 1em;
        display: flex;
        align-items: center;
        padding: 0 1em;
        ${first && `padding-left: 0`};
        text-decoration: none;
        vertical-align: middle;
        position: relative;
      }
      button::after {
        ${!last && `content: ''`};
        background: ${theme.colors.gray2};
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        width: 1px;
      }
      span {
        margin-left: 0.5em;
      }
    `}</style>
  </button>
)

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
        <IconLink icon={<FiCamera />} last>
          Submit flip
        </IconLink>
      </Link>
    </Flex>
  )
}

UserActions.propTypes = {
  onToggleSendInvite: PropTypes.func,
}

export default UserActions
