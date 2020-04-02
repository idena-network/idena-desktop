import React from 'react'

export const NotificationType = {
  Info: 'info',
  Error: 'error',
}

const NotificationStateContext = React.createContext()
const NotificationDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function NotificationProvider({children}) {
  const [notifications, setNotifications] = React.useState([])
  const [alerts, setAlerts] = React.useState([])

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (notifications.length) {
        setNotifications(notifications.slice(1))
      }
    }, 3000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [notifications])

  const addNotificationWithAction = React.useCallback(
    ({title, body, type = NotificationType.Info, action, actionName}) => {
      setNotifications(n => [...n, {title, body, type, action, actionName}])
    },
    []
  )

  const addNotification = React.useCallback(
    ({title, body, type = NotificationType.Info}) => {
      setNotifications(n => [...n, {title, body, type}])
    },
    []
  )

  const addError = React.useCallback(({title, body}) => {
    setNotifications(n => [...n, {title, body, type: NotificationType.Error}])
  }, [])

  const addAlert = React.useCallback(({title, body}) => {
    setAlerts(a => [...a, {title, body, type: NotificationType.Error}])
  }, [])

  return (
    <NotificationStateContext.Provider value={{notifications, alerts}}>
      <NotificationDispatchContext.Provider
        value={{addNotification, addError, addAlert, addNotificationWithAction}}
      >
        {children}
      </NotificationDispatchContext.Provider>
    </NotificationStateContext.Provider>
  )
}

function useNotificationState() {
  const context = React.useContext(NotificationStateContext)
  if (context === undefined) {
    throw new Error(
      'useNotificationState must be used within a NotificationProvider'
    )
  }
  return context
}

function useNotificationDispatch() {
  const context = React.useContext(NotificationDispatchContext)
  if (context === undefined) {
    throw new Error(
      'useNotificationDispatch must be used within a NotificationProvider'
    )
  }
  return context
}

export {NotificationProvider, useNotificationState, useNotificationDispatch}
