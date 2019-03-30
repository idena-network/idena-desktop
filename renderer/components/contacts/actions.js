import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

export const Actions = ({onInvite}) => (
  <div>
    <a href="/">Share Idena</a>
    <button type="button" onClick={onInvite}>
      Invite people
    </button>
    <style jsx>{`
      div {
        margin: 1em 0 2em;
      }
      a,
      button {
        background: none;
        border: none;
        color: ${theme.colors.primary};
        cursor: pointer;
        display: block;
        font-size: 1em;
        margin: 1em 0;
        padding: 0;
        text-decoration: none;
      }
    `}</style>
  </div>
)

Actions.propTypes = {
  onInvite: PropTypes.func,
}

export default Actions
