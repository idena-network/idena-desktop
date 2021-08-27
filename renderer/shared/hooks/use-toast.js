import {useToast} from '@chakra-ui/core'
import {Toast} from '../components/components'

export const useSuccessToast = () => useStatusToast()

export const useFailToast = () => useStatusToast('error')

export function useStatusToast(status) {
  const toast = useToast()

  const resolveToastParams = params =>
    typeof params === 'string' ? {title: params} : params

  return params =>
    toast({
      status,
      // eslint-disable-next-line react/display-name
      render: () => <Toast status={status} {...resolveToastParams(params)} />,
    })
}
