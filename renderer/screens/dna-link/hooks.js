import * as React from 'react'
import {useRouter} from 'next/router'
import {areSameCaseInsensitive, viewVotingHref} from '../oracles/utils'
import {dnaLinkMethod, isValidDnaUrl, parseQuery} from './utils'

export function useDnaLink({onInvalidLink}) {
  const [url, setUrl] = React.useState()

  React.useEffect(() => {
    if (url && !isValidDnaUrl(url)) onInvalidLink(url)
  }, [onInvalidLink, url])

  React.useEffect(() => {
    global.ipcRenderer.invoke('CHECK_DNA_LINK').then(setUrl)
  }, [])

  React.useEffect(() => {
    const handleDnaLink = (_, e) => setUrl(e)

    global.ipcRenderer.on('DNA_LINK', handleDnaLink)

    return () => {
      global.ipcRenderer.removeListener('DNA_LINK', handleDnaLink)
    }
  }, [])

  return {url, method: url && dnaLinkMethod(url)}
}

export function useDnaVoteUrl() {
  const {url, method} = useDnaLink()

  const router = useRouter()

  React.useEffect(() => {
    if (method === 'vote') {
      const {address} = parseQuery(url)
      if (!areSameCaseInsensitive(router.asPath, viewVotingHref(address))) {
        router.push(viewVotingHref(address))
        return null
      }
    }
  }, [method, router, url])
}
