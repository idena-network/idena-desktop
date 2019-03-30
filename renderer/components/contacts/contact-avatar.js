import React from 'react'
import PropTypes from 'prop-types'
import theme from '../../theme'

export const ContactAvatar = ({name, size = 1}) => (
  <div>
    <span role="img" aria-label={name}>
      🤖
    </span>
    <style jsx>{`
      div {
        background: ${theme.colors.gray};
        border-radius: 8px;
        font-size: ${`${size}em`};
        padding: 0.5em;
        margin: 0.5em;
        margin-right: 1em;
        margin-left: 0;
        text-align: center;
      }
    `}</style>
  </div>
)

ContactAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
}

export default ContactAvatar
