import * as React from 'react'
import {useRouter} from 'next/router'
import {DnaLinkMethod, useDnaLink} from '../dna-link/hooks'
import {extractQueryParams} from '../dna-link/utils'
import {areSameCaseInsensitive, viewVotingHref} from './utils'

export function useDnaVoteUrl() {
  const {url, method} = useDnaLink()

  const router = useRouter()

  React.useEffect(() => {
    if (method === DnaLinkMethod.Vote) {
      const {address} = extractQueryParams(url)
      if (!areSameCaseInsensitive(router.asPath, viewVotingHref(address))) {
        router.push(viewVotingHref(address))
      }
    }
  }, [method, router, url])
}
