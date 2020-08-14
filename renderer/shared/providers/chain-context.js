import {useAppMachine} from './app-context'

export function useChainState() {
  const [{context}] = useAppMachine()
  return context.sync
}
