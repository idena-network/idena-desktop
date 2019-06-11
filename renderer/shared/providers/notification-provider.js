import React, {createContext, useState, useEffect} from 'react'

export const NotificationType = {
  Info: 'info',
  Error: 'error',
}

const initialState = {
  notifications: [],
  onAddNotification: null,
  addNotification: null,
}

export const NotificationContext = createContext(initialState)

// eslint-disable-next-line react/prop-types
function NotificationProvider({children}) {
  const [notifications, setNotifications] = useState(initialState.notifications)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notifications.length) {
        const [, ...last] = notifications
        setNotifications(last)
      }
    }, 5000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [notifications])

  const onAddNotification = ({title, body, type = NotificationType.Info}) => {
    setNotifications([
      ...notifications,
      {title, body, type, timestamp: Date.now()},
    ])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        onAddNotification,
        addNotification: onAddNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
