import {useToast} from '@chakra-ui/core'
import {Toast} from '../components/components'

const resolveToastParams = params =>
  typeof params === 'string' ? {title: params} : params

export function useSuccessToast() {
  const toast = useToast()
  return params =>
    toast({
      // eslint-disable-next-line react/display-name
      render: () => <Toast {...resolveToastParams(params)} />,
    })
}

export function useFailToast() {
  const toast = useToast()
  return params =>
    toast({
      status: 'error',
      // eslint-disable-next-line react/display-name
      render: () => <Toast status="error" {...resolveToastParams(params)} />,
    })
}
