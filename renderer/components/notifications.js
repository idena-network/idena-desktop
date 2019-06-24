import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, rem, opacify} from 'polished'
import {FiFile} from 'react-icons/fi'
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
  notifications: PropTypes.arrayOf(PropTypes.shape(Notification.propTypes)),
}

const pickColor = (colors, type) => {
  switch (type) {
    default:
    case NotificationType.Info:
      return colors.text
    case NotificationType.Error:
      return colors.danger
  }
}

function Notification({title, body, type = NotificationType.Info}) {
  return (
    <div>
      <Flex width="100%" justify="center">
        <Box
          bg={theme.colors.white}
          px={rem(16)}
          py={rem(12)}
          css={{
            borderRadius: rem(8),
            boxShadow: `0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)`,
            color: pickColor(theme.colors, type),
            zIndex: 9,
          }}
          w="260px"
        >
          <Box
            my={theme.spacings.small}
            css={{fontWeight: theme.fontWeights.semi}}
          >
            <Flex justify="center" align="center">
              <FiFile style={{marginRight: rem(12)}} />
              {title}
            </Flex>
          </Box>
          {body && <Box css={wordWrap('break-word')}>{body}</Box>}
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
