import React from 'react'
import {useToast} from '@chakra-ui/react'
import {Toast} from '../components/components'

export const useSuccessToast = () => useStatusToast()

export const useFailToast = () => useStatusToast('error')

const DURATION = 5000

const resolveToastParams = params =>
  // eslint-disable-next-line no-nested-ternary
  typeof params === 'string'
    ? {title: params}
    : params instanceof Error
    ? {title: params?.message}
    : params

export function useStatusToast(status) {
  const toast = useToast()

  return params =>
    toast({
      status,
      // eslint-disable-next-line react/display-name
      render: () => <Toast status={status} {...resolveToastParams(params)} />,
    })
}

export const useClosableToast = () => {
  const chakraToast = useToast()

  const toastIdRef = React.useRef()

  const toast = React.useCallback(
    params =>
      (toastIdRef.current = chakraToast({
        duration: 5000,
        // eslint-disable-next-line react/display-name
        render: () => (
          <Toast duration={DURATION} {...resolveToastParams(params)} />
        ),
      })),
    [chakraToast]
  )

  const close = React.useCallback(() => {
    chakraToast.close(toastIdRef.current)
  }, [chakraToast])

  return React.useMemo(
    () => ({
      toast,
      close,
    }),
    [close, toast]
  )
}

export function useCloseToast() {
  const toast = useToast()

  return React.useCallback(
    id => {
      if (toast.isActive(id)) {
        toast.close(id)
      }
    },
    [toast]
  )
}

export function useCloseManyToasts(...ids) {
  const closeToast = useCloseToast()

  return React.useCallback(() => {
    ids.forEach(closeToast)
  }, [closeToast, ids])
}
