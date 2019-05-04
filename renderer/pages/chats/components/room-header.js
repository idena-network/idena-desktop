import React from 'react'
import PropTypes from 'prop-types'
import {Text} from '../../../shared/components'
import theme from '../../../shared/theme'

function RoomHeader({name = 'Julia', status = 'Online'}) {
  return (
    <div>
      <span role="img" aria-label="roomName">
        🤷
      </span>
      <div>
        <div>{name}</div>
        <Text color={theme.colors.primary} small>
          {status}
        </Text>
      </div>
      <style jsx>{`
        div {
          border-bottom: solid 1px rgb(232, 234, 237);
          display: flex;
          align-items: center;
          padding: 1em 0;
        }
        i {
          background: ${theme.colors.gray};
          border-radius: 8px;
          margin: 0 1em;
          padding: 0.5em 0.7em;
          font-style: normal;
        }
        div > div {
          border: none;
          display: block;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

RoomHeader.propTypes = {
  name: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
}

export default RoomHeader
