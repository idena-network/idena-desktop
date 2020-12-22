import React from 'react'
import {useService} from '@xstate/react'

export const AppMachineContext = React.createContext()

export function AppMachineProvider(props) {
  return <AppMachineContext.Provider {...props} />
}

export function useAppMachine() {
  return useService(React.useContext(AppMachineContext))
}
