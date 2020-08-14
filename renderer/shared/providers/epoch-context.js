import {useAppMachine} from './app-context'

export function useEpochState() {
  const [{context}] = useAppMachine()
  return context.epoch
}
