import React from 'react'
import PropTypes from 'prop-types'
import {Absolute} from '../shared/components'
import Notification from './notification'

function Notifications({notifications, alerts}) {
  return (
    <>
      {notifications && (
        <Absolute top="1em" left="0" right="0">
          {notifications.map(notification => (
            <Notification key={notification.timestamp} {...notification} />
          ))}
        </Absolute>
      )}
      {alerts && (
        <Absolute top="1em" left="0" right="0">
          {alerts.map(notification => (
            <Notification
              type="alert"
              key={notification.title}
              {...notification}
            />
          ))}
        </Absolute>
      )}
    </>
  )
}

const notificationPropType = PropTypes.shape({
  title: PropTypes.string,
  body: PropTypes.string,
  timestamp: PropTypes.number,
})

Notifications.propTypes = {
  notifications: PropTypes.arrayOf(notificationPropType),
  alerts: PropTypes.arrayOf(notificationPropType),
}

export default Notifications
