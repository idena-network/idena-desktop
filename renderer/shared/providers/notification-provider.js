import React, {createContext, useState, useEffect} from 'react'

const initialState = {
  notifications: [],
  onAddNotification: null,
  alerts: [],
  setAlert: null,
  clearAlert: null,
}

export const NotificationContext = createContext(initialState)

// eslint-disable-next-line react/prop-types
function NotificationProvider({children}) {
  const [notifications, setNotifications] = useState(initialState.notifications)
  const [alerts, setAlerts] = useState(initialState.alerts)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notifications.length) {
        const [, ...last] = notifications
        setNotifications(last)
      }
    }, 2000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [notifications])

  const onAddNotification = ({title, body}) => {
    setNotifications([...notifications, {title, body, timestamp: Date.now()}])
  }

  const setAlert = ({title, body}) => {
    setAlerts([{title, body}])
  }

  const clearAlert = () => {
    setAlerts([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        onAddNotification,
        setAlert,
        clearAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
