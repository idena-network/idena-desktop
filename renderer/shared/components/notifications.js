import React, {useState} from 'react'
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
import useId from '../hooks/use-id'
import {IconButton} from './button'

function Notifications() {
  const {notifications} = useNotificationState()
  const id = useId()
  return (
    <Absolute bottom={theme.spacings.normal} left="0" right="0">
      {notifications.map((notification, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Notification key={`notification-${id}-${idx}`} {...notification} />
      ))}
    </Absolute>
  )
}

function Notification({
  title,
  body,
  type = NotificationType.Info,
  action = null,
  actionName = '',
}) {
  const [hidden, setHidden] = useState(false)

  return (
    !hidden && (
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
                <Box css={{paddingTop: rem(3), paddingLeft: rem(20)}}>
                  {action && (
                    <IconButton
                      onClick={() => {
                        action()
                        setHidden(true)
                      }}
                    >
                      {actionName}
                    </IconButton>
                  )}
                </Box>
              </Flex>
            </Box>
            {body && (
              <Flex>
                <Box css={wordWrap('break-word')}>{body}</Box>
              </Flex>
            )}
          </Box>
        </Flex>
      </div>
    )
  )
}

Notification.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  type: PropTypes.oneOf(Object.values(NotificationType)),
  action: PropTypes.func,
  actionName: PropTypes.string,
}

export default Notifications
