import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../../shared/theme'
import {Box} from '../../../shared/components'

export function UserActions({
  canActivateInvite,
  onToggleActivateInvite,
  onToggleSendInvite,
}) {
  return (
    <Box p="1em 0">
      <button type="button">Share Idena</button>
      <button type="button" onClick={onToggleSendInvite}>
        Invite people
      </button>
      {canActivateInvite && (
        <button type="button" onClick={onToggleActivateInvite}>
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
          padding: 0;
          text-decoration: none;
        }
      `}</style>
    </Box>
  )
}

UserActions.propTypes = {
  canActivateInvite: PropTypes.bool,
  onToggleActivateInvite: PropTypes.func,
  onToggleSendInvite: PropTypes.func,
}

export default UserActions
