import {useToast} from '@chakra-ui/react'
import {Toast} from '../components/components'

export const useSuccessToast = () => useStatusToast()

export const useFailToast = () => useStatusToast('error')

export function useStatusToast(status) {
  const toast = useToast()

  const resolveToastParams = params =>
    // eslint-disable-next-line no-nested-ternary
    typeof params === 'string'
      ? {title: params}
      : params instanceof Error
      ? {title: params?.message}
      : params

  return params =>
    toast({
      status,
      // eslint-disable-next-line react/display-name
      render: () => <Toast status={status} {...resolveToastParams(params)} />,
    })
}
