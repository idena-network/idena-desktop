import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'
import {Box} from '../atoms'

export function UserActions({onActivateInviteShow}) {
  return (
    <Box p="1.5em 0.5em">
      <button type="button">Share Idena</button>
      <button type="button">Invite people</button>
      <button type="button" onClick={onActivateInviteShow}>
        Activate invite
      </button>
      <style jsx>{`
        button {
          background: none;
          border: none;
          color: ${theme.colors.primary};
          cursor: pointer;
          font-size: 1em;
          display: inline-block;
          margin-right: 1em;
          text-decoration: none;
        }
      `}</style>
    </Box>
  )
}

UserActions.propTypes = {
  onActivateInviteShow: PropTypes.func,
}

export default UserActions
