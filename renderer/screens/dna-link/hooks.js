import * as React from 'react'
import {dnaLinkMethod, extractQueryParams, isValidDnaUrl} from './utils'

export const DnaLinkMethod = {
  SignIn: 'signin',
  Send: 'send',
  RawTx: 'raw',
  Vote: 'vote',
  Invite: 'invite',
}

export function useDnaLink({onInvalidLink}) {
  const [url, setUrl] = React.useState()

  React.useEffect(() => {
    if (!sessionStorage.getItem('didCheckDnaLink')) {
      global.ipcRenderer.invoke('CHECK_DNA_LINK').then(setUrl)
      sessionStorage.setItem('didCheckDnaLink', 1)
    }
  }, [])

  React.useEffect(() => {
    const handleDnaLink = (_, e) => setUrl(e)

    global.ipcRenderer.on('DNA_LINK', handleDnaLink)

    return () => {
      global.ipcRenderer.removeListener('DNA_LINK', handleDnaLink)
    }
  }, [])

  const [method, setMethod] = React.useState()

  const [params, setParams] = React.useState()

  React.useEffect(() => {
    if (isValidDnaUrl(url)) {
      setMethod(dnaLinkMethod(url))

      const {
        callback_url: callbackUrl,
        callback_format: callbackFormat,
        ...dnaQueryParams
      } = extractQueryParams(url)

      setParams({
        ...dnaQueryParams,
        callbackUrl,
        callbackFormat,
      })
    }
  }, [url])

  React.useEffect(() => {
    if (url && !isValidDnaUrl(url)) {
      global.logger.error('Receieved invalid dna url', url)
      if (onInvalidLink) onInvalidLink(url)
    }
  }, [onInvalidLink, url])

  return {url, method, params}
}

export function useDnaLinkMethod(method, {onReceive, onInvalidLink}) {
  const dnaLink = useDnaLink({onInvalidLink})
  const {method: currentMethod} = dnaLink

  React.useEffect(() => {
    if (currentMethod === method) {
      if (onReceive) onReceive(dnaLink.url)
    }
  }, [currentMethod, dnaLink.url, method, onReceive])

  return dnaLink
}
