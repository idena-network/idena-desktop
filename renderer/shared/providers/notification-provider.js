import React, {createContext, useState, useEffect} from 'react'

const initialState = {
  notifications: [],
  onAddNotification: () => {},
  alerts: [],
  onAddAlert: () => {},
}

export const NotificationContext = createContext(initialState)

// eslint-disable-next-line react/prop-types
function NotificationProvider({children}) {
  const [notifications, setNotifications] = useState(initialState.notifications)
  const [alerts, setAlerts] = useState(initialState.alerts)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const [, ...last] = notifications
      setNotifications(last)
    }, 2000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [notifications])

  const onAddNotification = ({title, body}) => {
    setNotifications([...notifications, {title, body}])
  }

  const onAddAlert = ({title, body}) => {
    setAlerts([{title, body}])
  }

  const onClearAlert = () => {
    setAlerts([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        onAddNotification,
        onAddAlert,
        onClearAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
