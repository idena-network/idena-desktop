import React, {createContext, useState, useEffect} from 'react'

const initialState = {
  notifications: [],
  onAddNotification: () => {},
}

export const NotificationContext = createContext(initialState)

// eslint-disable-next-line react/prop-types
function NotificationProvider({children}) {
  const [notifications, setNotifications] = useState(initialState.notifications)

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

  return (
    <NotificationContext.Provider value={{notifications, onAddNotification}}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
