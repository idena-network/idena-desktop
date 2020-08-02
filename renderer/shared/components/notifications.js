/* eslint-disable react/prop-types */
import React, {useState} from 'react'
import {wordWrap, padding, margin, borderRadius} from 'polished'
import {useColorMode} from '@chakra-ui/core'
import {Absolute, Box} from '.'
import Flex from './flex'
import theme, {rem} from '../theme'
import {
  useNotificationState,
  NotificationType,
  NOTIFICATION_DELAY,
} from '../providers/notification-context'
import {IconButton} from './button'
import {Text} from './typo'

function Notifications() {
  const {notifications} = useNotificationState()
  return (
    <Snackbar>
      {notifications.map((notification, idx) => (
        <Notification
          key={`notification-${idx}`}
          wrap="break-all"
          {...notification}
        />
      ))}
    </Snackbar>
  )
}

export function Notification({
  title,
  body,
  type = NotificationType.Info,
  action = null,
  actionName = '',
  pinned,
  color = theme.colors.text,
  iconColor = theme.colors.primary,
  actionColor = theme.colors.primary,
  icon,
  wrap = 'break-word',
  delay = NOTIFICATION_DELAY,
}) {
  const [hidden, setHidden] = useState(false)
  const {colorMode} = useColorMode()

  return (
    !hidden && (
      <div
        style={{
          ...margin(0, 0, rem(20)),
        }}
      >
        <Flex
          align="center"
          css={{
            background:
              colorMode === 'light' ? theme.colors.white : theme.colors.black,
            borderRadius: rem(8),
            boxShadow: `0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)`,
            ...margin(0, 'auto'),
            ...padding(rem(6), rem(8), rem(6), rem(16)),
            position: 'relative',
            width: rem(480),
            zIndex: 9,
          }}
        >
          {icon || (
            <i
              className="icon icon--Info"
              style={{
                color:
                  type === NotificationType.Error
                    ? theme.colors.danger
                    : iconColor,
                fontSize: rem(20),
                marginRight: rem(12),
              }}
            />
          )}
          <Box style={{lineHeight: rem(20), ...wordWrap(wrap)}}>
            <Box style={{fontWeight: theme.fontWeights.medium}}>{title}</Box>
            {body && <Text color={color}>{body}</Text>}
          </Box>
          <Box
            css={{
              ...margin(0, 0, 0, 'auto'),
              ...padding(rem(6), rem(12)),
            }}
          >
            {action && (
              <IconButton
                style={{
                  color:
                    type === NotificationType.Error
                      ? theme.colors.danger
                      : actionColor,
                  lineHeight: rem(20),
                  ...padding(0),
                }}
                onClick={() => {
                  action()
                  setHidden(true)
                }}
              >
                {actionName}
              </IconButton>
            )}
          </Box>
          {!pinned && (
            <Box
              style={{
                background: theme.colors[colorMode].gray2,
                height: rem(3),
                ...borderRadius('bottom', rem(8)),
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                animation: `escape ${delay}ms linear forwards`,
              }}
            />
          )}
        </Flex>
        <style jsx global>{`
          @keyframes escape {
            from {
              right: 0;
            }
            to {
              right: 100%;
            }
          }
        `}</style>
      </div>
    )
  )
}

export function Snackbar(props) {
  return <Absolute bottom={0} left={0} right={0} {...props} />
}

export default Notifications
