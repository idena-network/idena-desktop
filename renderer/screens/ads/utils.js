/* eslint-disable no-use-before-define */
import Jimp from 'jimp'
import i18n from '../../i18n'
import {fetchNetworkSize} from '../../shared/api/dna'
import {Profile} from '../../shared/models/profile'
import {VotingStatus} from '../../shared/types'
import {dexieDb} from '../../shared/utils/dexieDb'
import {
  areSameCaseInsensitive,
  callRpc,
  HASH_IN_MEMPOOL,
  hexToObject,
  prependHex,
} from '../../shared/utils/utils'
import {isValidUrl} from '../dna/utils'
import {AdVotingOption, AdVotingOptionId} from './types'

export const OS = {
  Windows: 'windows',
  macOS: 'macos',
  Linux: 'linux',
  iOS: 'ios',
  Android: 'android',
}

export function currentOs() {
  switch (true) {
    case /Android/.test(navigator.userAgent):
      return OS.Android
    case /iPhone|iPad|iPod/.test(navigator.userAgent):
      return OS.iOS
    case /Win/.test(navigator.userAgent):
      return OS.Windows
    case /Mac/.test(navigator.userAgent):
      return OS.macOS
    case /Linux/.test(navigator.userAgent):
      return OS.Linux
    default:
      return null
  }
}

export const isTargetedAd = (targetA, targetB) =>
  compareNullish(targetA.language, targetB.language, areSameCaseInsensitive) &&
  compareNullish(targetA.os, targetB.os, areSameCaseInsensitive) &&
  compareNullish(
    targetA.age,
    targetB.age,
    (ageA, ageB) => Number(ageB) >= Number(ageA)
  ) &&
  compareNullish(
    targetA.stake,
    targetB.stake,
    (stakeA, stakeB) => Number(stakeB) >= Number(stakeA)
  )

export const areCompetingAds = (targetA, targetB) =>
  compareNullish(targetA.language, targetB.language, areSameCaseInsensitive) ||
  compareNullish(targetA.os, targetB.os, areSameCaseInsensitive) ||
  compareNullish(
    targetA.age,
    targetB.age,
    (ageA, ageB) => Number(ageB) >= Number(ageA)
  ) ||
  compareNullish(
    targetA.stake,
    targetB.stake,
    (stakeA, stakeB) => Number(stakeB) >= Number(stakeA)
  )

export const compareNullish = (field, targetField, condition) =>
  field ? condition(field, targetField) : true

export const selectProfileHash = data => data.profileHash

export async function getAdVoting(address) {
  const persistedAdVoting = await dexieDb
    .table('adVotings')
    .get(address)
    .catch(() => null)

  if (persistedAdVoting) {
    return persistedAdVoting
  }

  const voting = await fetchAdVoting(address)

  if (isFinalVoting(voting) && voting?.isFetched) {
    await dexieDb.table('adVotings').put({...voting, address})
  }

  return voting
}

async function fetchAdVoting(address) {
  const batchData = await callRpc('contract_batchReadData', address, [
    {key: 'state', format: 'byte'},
    {key: 'fact', format: 'hex'},
    {key: 'result', format: 'byte'},
  ])

  try {
    const {value: state, error: stateError} = batchData.find(
      x => x.key === 'state'
    )

    if (Boolean(stateError) && stateError !== 'data is nil')
      throw new Error(stateError)

    const status =
      stateError === 'data is nil'
        ? VotingStatus.Terminated
        : mapToVotingStatus(state)

    return {
      status,
      ...hexToObject(batchData.find(x => x.key === 'fact').value),
      result: batchData.find(x => x.key === 'result').value,
      isFetched: true,
    }
  } catch (e) {
    console.error(e)
  }
}

export const createContractDataReader = address => (key, format) =>
  callRpc('contract_readData', address, key, format)

const mapToVotingStatus = status => {
  switch (status) {
    case 0:
      return VotingStatus.Pending
    case 1:
      return VotingStatus.Open
    case 2:
      return VotingStatus.Archived
    default:
      return status
  }
}

const buildAdReviewVotingOption = option => ({
  id: AdVotingOptionId[option],
  value: option,
})

export const adVotingDefaults = {
  title: 'Is this ad appropriate?',
  votingDuration: !global.isDev ? 4320 : 10,
  publicVotingDuration: !global.isDev ? 4320 : 10,
  winnerThreshold: 51,
  quorum: 1,
  committeeSize: 300,
  ownerFee: 0,
  shouldStartImmediately: true,
  isFreeVoting: true,
  options: [
    buildAdReviewVotingOption(AdVotingOption.Approve),
    buildAdReviewVotingOption(AdVotingOption.Reject),
  ],
}

export const buildAdReviewVoting = ({title, adCid}) => ({
  ...adVotingDefaults,
  desc: title,
  adCid,
})

export const calculateMinOracleReward = async () =>
  5000 / (await fetchNetworkSize())

export async function fetchProfileAds(address) {
  try {
    const {profileHash} = await callRpc('dna_identity', address)

    return profileHash
      ? Profile.fromHex(await callRpc('ipfs_get', profileHash)).ads ?? []
      : []
  } catch {
    console.error('Error fetching ads for identity', address)
    return []
  }
}

export const isApprovedVoting = voting =>
  isFinalVoting(voting) &&
  isApprovedAd(voting) &&
  voting.title === adVotingDefaults.title

export const isRejectedVoting = voting =>
  isFinalVoting(voting) && isRejectedAd(voting)

const isFinalVoting = voting =>
  [VotingStatus.Archived, VotingStatus.Terminated].includes(voting?.status)

const isApprovedAd = voting =>
  isValidAdOption(
    voting?.options?.find(option => option?.id === voting?.result),
    AdVotingOption.Approve
  )

const isRejectedAd = voting =>
  isValidAdOption(
    voting?.options?.find(option => option?.id === voting?.result),
    AdVotingOption.Reject
  )

export const isValidAdOption = (option, targetValue) =>
  option?.id === AdVotingOptionId[targetValue] && option?.value === targetValue

export const adImageThumbSrc = ad =>
  typeof ad.thumb === 'string'
    ? ad.thumb
    : ad.thumb && URL.createObjectURL(ad.thumb)

export async function compressAdImage(
  // eslint-disable-next-line no-shadow
  bytes,
  {width = 80, height = 80, type} = {width: 80, height: 80, type: 'image/jpeg'}
) {
  const image = await Jimp.read(bytes)

  const imageWidth = image.getWidth()
  const imageHeight = image.getHeight()

  const resizedImage =
    imageWidth > imageHeight
      ? image.resize(width, Jimp.AUTO)
      : image.resize(Jimp.AUTO, height)

  const compressedImage =
    type === 'image/png'
      ? resizedImage.deflateLevel(1)
      : resizedImage.quality(60)

  return compressedImage.getBufferAsync(type)
}

export function validateAd(ad) {
  return {
    title: validateAdTitle(ad.title),
    desc: validateAdDesc(ad.desc),
    url: validateAdUrl(ad.url),
    thumb: validateAdThumb(ad.thumb),
    media: validateAdMedia(ad.media),
  }
}

function validateAdTitle(title) {
  if (typeof title !== 'string' || title.trim().length < 1) {
    return i18n.t('Title cannot be empty')
  }

  if (title.trim().length > 40) {
    return i18n.t('Title should be less than 40 characters long')
  }
}

function validateAdDesc(desc) {
  if (typeof desc !== 'string' || desc.trim().length < 1) {
    return i18n.t('Description cannot be empty')
  }

  if (desc.trim().length > 70) {
    return i18n.t('Description should be less than 70 characters long')
  }
}

function validateAdUrl(url) {
  if (typeof url !== 'string' || !isValidUrl(url)) {
    return i18n.t('URL must start with http, https or dna')
  }
}

function validateAdThumb(thumb) {
  if (!isValidImage(thumb)) {
    return i18n.t('Ad thumbnail cannot be empty')
  }

  if (isExceededImageSize(thumb)) {
    return i18n.t('Ad thumbnail should be less than 1MB')
  }
}

function validateAdMedia(media) {
  if (!isValidImage(media)) {
    return i18n.t('Ad media cannot be empty')
  }

  if (isExceededImageSize(media)) {
    return i18n.t('Ad media should be less than 1MB')
  }
}

export function isValidImage(image) {
  if (typeof window !== 'undefined') {
    return image instanceof File && image.size > 0
  }

  return false
}

function isExceededImageSize(image) {
  return image.size > 1024 * 1024
}

export const adFallbackSrc = '/static/body-medium-pic-icn.svg'

export const isMiningTx = txData =>
  (txData?.blockHash ?? HASH_IN_MEMPOOL) === HASH_IN_MEMPOOL

export const isMinedTx = txData =>
  (txData?.blockHash ?? HASH_IN_MEMPOOL) !== HASH_IN_MEMPOOL

export async function sendTx(params) {
  return callRpc('dna_sendTransaction', params)
}

export async function estimateTx(params) {
  return callRpc('bcn_estimateTx', params)
}

export async function sendToIpfs(hex) {
  const cid = await callRpc('ipfs_add', prependHex(hex), true)

  const hash = await callRpc('dna_storeToIpfs', {cid})

  return {
    cid,
    hash,
  }
}

export const validateAdVoting = ({ad, voting}) => {
  if (global.isDev) return true

  if (ad?.votingParams) {
    const areSameVotingParams = [
      'votingDuration',
      'publicVotingDuration',
      'quorum',
      'committeeSize',
    ].every(
      prop =>
        ad.votingParams[prop] === voting[prop] &&
        ad.votingParams[prop] === adVotingDefaults[prop] &&
        voting[prop] === adVotingDefaults[prop]
    )

    const [maybeApproveOption, maybeRejectOption] = voting.options

    const areValidOptions =
      isValidAdOption(maybeApproveOption, AdVotingOption.Approve) &&
      isValidAdOption(maybeRejectOption, AdVotingOption.Reject)

    return areSameVotingParams && areValidOptions
  }

  return false
}

export function calculateTotalAdScore({target, burnAmount}) {
  return burnAmount * calculateTargetScore(target)
}

export function calculateTargetScore(target) {
  return (
    calculateTargetParamWeight(target?.language, 22) *
    calculateTargetParamWeight(target?.os, 5)
  )
}

export const calculateTargetParamWeight = (param, weight) =>
  param ? weight : 1
