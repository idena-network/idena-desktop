import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'
import {Box} from '../atoms'

export function UserActions({showActivateInvite, onActivateInviteShow}) {
  return (
    <Box p="1.5em 0.5em">
      <button type="button">Share Idena</button>
      <button type="button">Invite people</button>
      {showActivateInvite && (
        <button type="button" onClick={onActivateInviteShow}>
          Activate invite
        </button>
      )}
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
  showActivateInvite: PropTypes.bool,
}

export default UserActions
