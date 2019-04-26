import React from 'react'
import PropTypes from 'prop-types'

export function UserAvatar({name}) {
  return (
    <>
      <img src={`https://github.com/${name}.png`} alt="avatar" />
      <style jsx>{`
        img {
          border-radius: 10px;
          width: 96px;
          margin-right: 1em;
        }
      `}</style>
    </>
  )
}

UserAvatar.propTypes = {
  name: PropTypes.string,
}

export default UserAvatar
