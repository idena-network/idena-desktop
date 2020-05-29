/* eslint-disable react/prop-types */
import React, {useState} from 'react'
import {wordWrap, padding, margin, borderRadius} from 'polished'
import {Absolute, Box} from '.'
import Flex from './flex'
import theme, {rem} from '../theme'
import {
  useNotificationState,
  NotificationType,
  NOTIFICATION_DELAY,
} from '../providers/notification-context'
import useId from '../hooks/use-id'
import {IconButton} from './button'
import {Text} from './typo'

function Notifications() {
  const {notifications} = useNotificationState()
  const id = useId()
  return (
    <Absolute bottom={0} left={0} right={0}>
      {notifications.map((notification, idx) => (
        <Notification key={`notification-${id}-${idx}`} {...notification} />
      ))}
    </Absolute>
  )
}

export function Notification({
  title,
  body,
  type = NotificationType.Info,
  action = null,
  actionName = '',
  pinned,
  bg = theme.colors.white,
  color = theme.colors.text,
  iconColor = theme.colors.primary,
}) {
  const [hidden, setHidden] = useState(false)

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
            background: bg,
            borderRadius: rem(8),
            boxShadow: `0 3px 12px 0 rgba(83, 86, 92, 0.1), 0 2px 3px 0 rgba(83, 86, 92, 0.2)`,
            color,
            ...margin(0, 'auto'),
            ...padding(rem(6), rem(8), rem(6), rem(16)),
            position: 'relative',
            width: rem(480),
            zIndex: 9,
          }}
        >
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
          <Box style={{lineHeight: rem(20), ...wordWrap('break-all')}}>
            <Box style={{fontWeight: theme.fontWeights.medium}}>{title}</Box>
            {body && <Text>{body}</Text>}
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
                      : theme.colors.primary,
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
                background: theme.colors.gray2,
                height: rem(3),
                ...borderRadius('bottom', rem(8)),
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                animation: `escape ${NOTIFICATION_DELAY}ms linear forwards`,
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

export default Notifications
