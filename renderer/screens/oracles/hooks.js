import {useQuery} from 'react-query'
import {useIdentityState} from '../../shared/providers/identity-context'
import {callRpc} from '../../shared/utils/utils'
import {ContractRpcMode} from './types'
import {createContractCaller} from './utils'

async function loadActions(id, from) {
  async function checkAction(fn) {
    try {
      const result = await fn
      return !!result?.receipt?.success
    } catch (e) {
      return false
    }
  }

  const callContract = createContractCaller({
    from,
    contractHash: id,
  })

  return {
    canFinish: await checkAction(
      callContract('finishVoting', ContractRpcMode.Estimate)
    ),
    canProlong: await checkAction(
      callContract('prolongVoting', ContractRpcMode.Estimate)
    ),
    canTerminate: await checkAction(
      callRpc('contract_estimateTerminate', {
        from,
        contract: id,
      })
    ),
  }
}

export function useOracleActions(id) {
  const identity = useIdentityState()

  const {data, refetch, isFetching} = useQuery(
    ['oracle-actions', id],
    () => loadActions(id, identity.address),
    {
      retry: false,
      enabled: !!id && !!identity.address,
    }
  )

  return [
    {
      ...data,
      isFetching,
    },
    refetch,
  ]
}
