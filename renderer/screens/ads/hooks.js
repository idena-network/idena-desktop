/* eslint-disable no-use-before-define */
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useQueries, useQuery} from 'react-query'
import {Ad} from '../../shared/models/ad'
import {AdKey} from '../../shared/models/adKey'
import {Profile} from '../../shared/models/profile'
import {useIdentity} from '../../shared/providers/identity-context'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'
import {areSameCaseInsensitive} from '../oracles/utils'
import {AdVotingOption, AdVotingOptionId} from './types'
import {currentOs, fetchAdVoting, isSameAdKey} from './utils'

export function useAdRotation(limit = 5) {
  const {i18n} = useTranslation()
  const rpcFetcher = useRpcFetcher()

  const coinbase = useCoinbase()

  const [identity] = useIdentity()

  const {data: competitorAds} = useAdCompetitors(
    {
      address: String(coinbase),
      key: new AdKey({
        language: i18n.language,
        os: typeof window !== 'undefined' ? currentOs() : '',
        age: identity.age,
        stake: identity.stake,
      }),
    },
    limit
  )

  const competingIdentities = [
    ...new Set(competitorAds?.map(burn => burn.address) ?? []),
  ]

  const competingProfileHashQueries = useQueries(
    competingIdentities.map(address => ({
      queryKey: ['dna_identity', address],
      queryFn: rpcFetcher,
      select: selectProfileHash,
    })) ?? []
  )

  const {decodeProfile, decodeAd, decodeAdKey} = useProtoProfileDecoder()

  const competingProfileHashes =
    competingProfileHashQueries?.filter(query => Boolean(query.data)) ?? []

  const decodedProfiles = useQueries(
    competingProfileHashes.map(({data}) => ({
      queryKey: ['ipfs_get', data],
      queryFn: rpcFetcher,
      enabled: Boolean(data),
      select: decodeProfile,
      staleTime: Infinity,
    }))
  )

  const competingProfileAds = decodedProfiles
    .map(({data}) => data?.ads)
    .flat()
    .filter(profileAd =>
      (competitorAds ?? []).some(burningAd =>
        isSameAdKey(decodeAdKey(burningAd.key), profileAd?.key ?? {})
      )
    )

  const approvedProfileAds = useQueries(
    competingProfileAds.map(profileAd => ({
      queryKey: ['profileAd', profileAd?.votingAddress],
      queryFn: async ({queryKey: [, votingAddress]}) => {
        if (votingAddress) {
          const voting = await fetchAdVoting(votingAddress)
          return {
            ...profileAd,
            voting,
          }
        }
      },
      enabled: Boolean(profileAd?.votingAddress),
    }))
  ).filter(({data}) => {
    const voting = data?.voting
    return (
      voting?.adCid === data?.cid &&
      voting?.status === VotingStatus.Archived &&
      voting?.result === AdVotingOptionId[AdVotingOption.Approve]
    )
  })

  const decodedProfileAds = useQueries(
    approvedProfileAds.map(({data: ad}) => ({
      queryKey: ['ipfs_get', ad.cid],
      queryFn: rpcFetcher,
      enabled: Boolean(ad.cid),
      select: decodeAd,
      staleTime: Infinity,
    }))
  )

  return decodedProfileAds?.map(x => x.data) ?? []
}

function useAdCompetitors(target, limit) {
  const {decodeAdKey} = useProtoProfileDecoder()

  return useRpc('bcn_burntCoins', [], {
    enabled: Boolean(target.address),
    select: React.useCallback(
      data =>
        data
          ?.filter(burn =>
            isCompetingAd(target)({...burn, key: decodeAdKey(burn.key)})
          )
          .slice(0, limit) ?? [],
      [limit, target, decodeAdKey]
    ),
  })
}

const isCompetingAd = targetAd => ad =>
  targetAd.address === ad.address && isCompetingAdKey(ad.key, targetAd.key)

const isCompetingAdKey = (
  {language: adLanguage, os: adOS, age: adAge, stake: adStake},
  {language: targetLanguage, os: targetOS, age: targetAge, stake: targetStake}
) =>
  weakCompare(adLanguage, targetLanguage, areSameCaseInsensitive) &&
  weakCompare(adOS, targetOS, areSameCaseInsensitive) &&
  weakCompare(
    adAge,
    targetAge,
    // eslint-disable-next-line no-shadow
    (adAge, targetAge) => Number(targetAge) >= Number(adAge)
  ) &&
  weakCompare(
    adStake,
    targetStake,
    // eslint-disable-next-line no-shadow
    (adStake, targetStake) => Number(targetStake) >= Number(adStake)
  )

export const weakCompare = (field, targetField, condition) =>
  field ? condition(field, targetField) : true

const selectProfileHash = data => data.profileHash

export function useProtoProfileEncoder() {
  return {
    encodeAd: React.useCallback(ad => new Ad(ad).toHex(), []),
    encodeAdKey: React.useCallback(adKey => new AdKey(adKey).toHex(), []),
    encodeProfile: React.useCallback(
      profile => new Profile(profile).toHex(),
      []
    ),
  }
}

export function useProtoProfileDecoder() {
  return {
    decodeAd: React.useCallback(Ad.fromHex, []),
    decodeAdKey: React.useCallback(AdKey.fromHex, []),
    decodeProfile: React.useCallback(Profile.fromHex, []),
  }
}

export function useCoinbase() {
  return useRpc('dna_getCoinbaseAddr', []).data
}

export function useRpcFetcher() {
  const fetcher = React.useMemo(
    () => ({queryKey: [method, params]}) => callRpc(method, params),
    []
  )

  return fetcher
}

export function useRpc(method, params, options) {
  const rpcFetcher = useRpcFetcher()

  return useQuery([method, params], rpcFetcher, options)
}
