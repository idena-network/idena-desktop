import React from 'react'
import PropTypes from 'prop-types'
import {wordWrap, rem} from 'polished'
import {FiFile} from 'react-icons/fi'
import {Absolute, Box} from '.'
import Flex from './flex'
import theme from '../theme'
import {
  useNotificationState,
  NotificationType,
} from '../providers/notification-context'

function Notifications() {
  const {notifications} = useNotificationState()
  return (
    <Absolute bottom={theme.spacings.normal} left="0" right="0">
      {notifications.map(notification => (
        <Notification key={notification.title + Date.now()} {...notification} />
      ))}
    </Absolute>
  )
}

function Notification({title, body, type = NotificationType.Info}) {
  return (
    <div>
      <Flex width="100%" justify="center">
        <Box
          bg={theme.colors.white}
          px={rem(16)}
          py={rem(12)}
          my={rem(theme.spacings.small8)}
          css={{
            borderRadius: rem(8),
            boxShadow: `0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)`,
            color:
              type === NotificationType.Error
                ? theme.colors.danger
                : theme.colors.text,
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
