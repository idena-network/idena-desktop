import {useQuery} from 'react-query'
import {State} from 'xstate'
import {useCoinbase} from '../../ads/hooks'
import {loadValidationState} from '../utils'

export function usePersistedValidationState(options) {
  const coinbase = useCoinbase()

  return useQuery({
    queryKey: ['validationState', coinbase],
    queryFn: () => {
      const validationStateDefinition = loadValidationState()

      if (validationStateDefinition) {
        return State.create(validationStateDefinition)
      }
    },
    ...options,
  })
}
