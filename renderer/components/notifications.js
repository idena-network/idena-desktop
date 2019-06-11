import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, rem} from 'polished'
import {Absolute, Box} from '../shared/components'
import Flex from '../shared/components/flex'
import theme from '../shared/theme'
import {NotificationType} from '../shared/providers/notification-provider'

function Notifications({notifications}) {
  return (
    <Absolute bottom={theme.spacings.normal} left="0" right="0">
      {notifications.map(notification => (
        <Notification key={notification.timestamp} {...notification} />
      ))}
    </Absolute>
  )
}

Notifications.propTypes = {
  // eslint-disable-next-line no-use-before-define
  notifications: PropTypes.arrayOf(Notification.propTypes),
}

const pickBgColor = (colors, type) => {
  switch (type) {
    default:
    case NotificationType.Info:
      return colors.gray
    case NotificationType.Error:
      return colors.danger
  }
}

const pickColor = (colors, type) => {
  switch (type) {
    default:
    case NotificationType.Info:
      return colors.text
    case NotificationType.Error:
      return colors.white
  }
}

function Notification({title, body, type = NotificationType.Info}) {
  return (
    <div>
      <Flex width="100%" justify="center">
        <Box
          bg={pickBgColor(theme.colors, type)}
          p={theme.spacings.normal}
          css={{borderRadius: rem(10), color: pickColor(theme.colors, type)}}
        >
          <Box
            my={theme.spacings.small}
            css={{fontWeight: theme.fontWeights.semi}}
          >
            {title}
          </Box>
          {body && (
            <Box w="480px" css={wordWrap('break-word')}>
              {body}
            </Box>
          )}
        </Box>
      </Flex>
    </div>
  )
}

Notification.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  type: PropTypes.oneOf(Object.values(NotificationType)),
}

export default Notifications
