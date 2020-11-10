import dayjs from 'dayjs'
import {assign} from 'xstate'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'
import {strip} from '../../shared/utils/obj'
import {VotingListFilter} from './types'

export const ContractRpcMode = {
  Estimate: 'estimate',
  Call: 'call',
}

export function resolveVotingStatus({status, startDate, vote}) {
  if (status !== VotingStatus.Open)
    return startDate ? VotingStatus.Pending : VotingStatus.Invalid
  return vote ? VotingStatus.Voted : VotingStatus.Open
}

export const isVotingStatus = targetStatus => ({status}) =>
  areSameCaseInsensitive(status, targetStatus)

export const isVotingMiningStatus = targetStatus => ({status, txHash}) =>
  status === targetStatus && Boolean(txHash)

export const eitherStatus = (...statuses) => ({status}) =>
  statuses.some(s => areSameCaseInsensitive(s, status))

export const setVotingStatus = status =>
  assign({
    prevStatus: ({status: currentStatus}) => currentStatus,
    status,
  })

export function apiUrl(path) {
  return `http://195.201.2.44:18888/api/${path}`
}

export async function fetchVotings({
  all = false,
  own = false,
  oracle,
  address = oracle,
  limit = 20,
  ...params
}) {
  const url = new URL(
    apiUrl(
      own ? `Address/${address}/OracleVotingContracts` : 'OracleVotingContracts'
    )
  )

  let queryParams = {limit, all: all.toString(), oracle, ...params}

  queryParams = all ? queryParams : {...queryParams, address}

  Object.entries(queryParams)
    .filter(([, v]) => Boolean(v))
    .forEach(([k, v]) => {
      url.searchParams.append(k, v)
    })

  const {result, error, continuationToken} = await (await fetch(url)).json()

  if (error) throw new Error(error.message)

  return {result, continuationToken}
}

export async function fetchOracleRewardsEstimates() {
  const {result, error} = await (
    await fetch(apiUrl('OracleVotingContract/EstimatedOracleRewards'))
  ).json()

  if (error) throw new Error(error.message)

  return result
}

export async function fetchContractTxs({
  address,
  contractAddress,
  limit,
  continuationToken,
}) {
  const url = new URL(apiUrl('Contracts/AddressContractTxBalanceUpdates'))

  Object.entries({
    address,
    contractAddress,
    limit,
    continuationToken,
  })
    .filter(([, v]) => Boolean(v))
    .forEach(([k, v]) => {
      url.searchParams.append(k, v)
    })

  const {result, error} = await (await fetch(url)).json()

  if (error) throw new Error(error.message)

  return result
}

export async function fetchContractBalanceUpdates({
  address,
  contractAddress,
  limit = 50,
}) {
  return (
    (
      await (
        await fetch(
          apiUrl(
            `Address/${address}/Contract/${contractAddress}/BalanceUpdates?limit=${limit}`
          )
        )
      ).json()
    ).result || []
  )
}

export async function fetchNetworkSize() {
  const {result, error} = await (
    await fetch(apiUrl('onlineidentities/count'))
  ).json()

  if (error) throw new Error(error.message)

  return result
}

export const createContractCaller = ({
  from,
  contractHash,
  gasCost,
  txFee,
  amount,
  broadcastBlock,
}) => (method, mode = ContractRpcMode.Call, ...args) => {
  const isCalling = mode === ContractRpcMode.Call

  const payload = strip({
    from,
    contract: contractHash,
    method,
    maxFee: isCalling ? contractMaxFee(gasCost, txFee) : null,
    amount: isCalling && method === 'sendVote' ? null : amount,
    broadcastBlock: isCalling && method === 'sendVote' ? broadcastBlock : null,
    args: buildDynamicArgs(...args),
  })

  return callRpc(isCalling ? 'contract_call' : 'contract_estimateCall', payload)
}

export const createContractReadonlyCaller = ({contractHash}) => (
  method,
  format = 'hex',
  ...args
) =>
  callRpc(
    'contract_readonlyCall',
    strip({
      contract: contractHash,
      method,
      format,
      args: buildDynamicArgs(...args),
    })
  )

export const createContractDataReader = ({contractHash}) => (key, format) =>
  callRpc('contract_readData', contractHash, key, format)

export function objectToHex(obj) {
  return Buffer.from(stringToHex(JSON.stringify(obj)))
}

function stringToHex(str) {
  return Buffer.from(new TextEncoder().encode(str)).toString('hex')
}

export function hexToObject(hex) {
  return JSON.parse(
    new TextDecoder().decode(Buffer.from(hex.substring(2), 'hex'))
  )
}

export function buildContractDeploymentArgs(
  {
    title,
    desc,
    startDate,
    votingDuration,
    publicVotingDuration,
    winnerThreshold,
    quorum,
    committeeSize,
    votingMinPayment = 0,
    maxOptions,
    options,
    ownerFee = 0,
    shouldStartImmediately,
    isFreeVoting,
  },
  {from, stake, gasCost, txFee},
  mode = ContractRpcMode.Call
) {
  return strip({
    from,
    codeHash: '0x02',
    amount: stake,
    maxFee:
      mode === ContractRpcMode.Call ? contractMaxFee(gasCost, txFee) : null,
    args: buildDynamicArgs(
      {
        value: `0x${objectToHex({
          title,
          desc,
          options: options.filter(({value}) => Boolean(value)),
        })}`,
      },
      {
        value: dayjs(shouldStartImmediately ? Date.now() : startDate).unix(),
        format: 'uint64',
      },
      {value: votingDuration, format: 'uint64'},
      {value: publicVotingDuration, format: 'uint64'},
      {value: winnerThreshold, format: 'uint64'},
      {value: quorum, format: 'uint64'},
      {value: committeeSize, format: 'uint64'},
      {value: maxOptions, format: 'uint64'},
      {
        value: isFreeVoting ? 0 : votingMinPayment,
        format: 'dna',
      },
      {value: ownerFee, format: 'byte'}
    ),
  })
}

export function buildDynamicArgs(...args) {
  return args
    .map(({format = 'hex', value}, index) => ({
      index,
      format,
      value: typeof value !== 'string' ? value?.toString() ?? null : value,
    }))
    .filter(({value = null}) => value !== null)
}

export function contractMaxFee(gasCost, txFee) {
  return Math.ceil((Number(gasCost) + Number(txFee)) * 1.1)
}

export const BLOCK_TIME = 20
const defaultVotingDuration = 4320

export const votingFinishDate = ({
  startDate,
  votingDuration = defaultVotingDuration,
  publicVotingDuration = defaultVotingDuration,
}) =>
  dayjs(startDate)
    .add(votingDuration * BLOCK_TIME, 's')
    .add(publicVotingDuration * BLOCK_TIME, 's')
    .toDate()

export function viewVotingHref(id) {
  return `/oracles/view?id=${id}`
}

export const byContractHash = a => b =>
  areSameCaseInsensitive(a.contractHash, b.contractHash)

export function areSameCaseInsensitive(a, b) {
  return a?.toUpperCase() === b?.toUpperCase()
}

export function oracleReward({
  balance,
  votesCount,
  quorum,
  committeeSize,
  ownerFee,
}) {
  if ([balance, votesCount, quorum, committeeSize].some(v => Number.isNaN(v)))
    return undefined

  return (
    (balance * (1 - ownerFee / 100)) /
    Math.max(quorumVotesCount({quorum, committeeSize}), votesCount)
  )
}

export function quorumVotesCount({quorum, committeeSize}) {
  return Math.ceil((committeeSize * quorum) / 100)
}

export function winnerVotesCount({winnerThreshold, votes}) {
  return Math.ceil((votes * winnerThreshold) / 100)
}

export function hasQuorum({votes, quorum, committeeSize}) {
  const requiredVotesCount = quorumVotesCount({quorum, committeeSize})
  return votes.some(({count}) => count >= requiredVotesCount)
}

export function hasWinner({votes, winnerThreshold, quorum, committeeSize}) {
  const requiredVotesCountByVotes = winnerVotesCount({winnerThreshold, votes})
  const requiredVotesCountByCommittee = winnerVotesCount({
    winnerThreshold,
    votes: committeeSize,
  })
  const didReachQuorum = hasQuorum({votes, quorum, committeeSize})

  return votes.some(
    ({count}) =>
      count >= requiredVotesCountByCommittee ||
      (count >= requiredVotesCountByVotes && didReachQuorum)
  )
}

export function minOracleReward(feePerGas) {
  return dnaFeePerGas(feePerGas) * 100 * 100
}

export function votingMinStake(feePerGas) {
  return 3000000 * dnaFeePerGas(feePerGas)
}

// eslint-disable-next-line no-shadow
export function votingMinBalance({oracleReward, committeeSize, feePerGas}) {
  return Math.max(oracleReward, minOracleReward(feePerGas)) * committeeSize
}

function dnaFeePerGas(value) {
  return value * 10 ** -18
}

export function blocksPerInterval({
  weeks,
  days = weeks * 7,
  hours = days * 24,
}) {
  return Math.round((hours * 60 * 60) / 20)
}

export function durationPreset(interval, label) {
  const value = blocksPerInterval(interval)

  if (label) return {value, label}

  const [[unit], unitValue] = Object.entries(interval).find(([, v]) => v)

  return {
    value,
    label: `${unitValue}${unit}`,
  }
}

export function votingStatuses(filter) {
  switch (filter) {
    case VotingListFilter.Todo:
      return [VotingStatus.Pending, VotingStatus.Open]
    case VotingListFilter.Voting:
      return [VotingStatus.Voted, VotingStatus.Counting]
    case VotingListFilter.Closed:
      return [VotingStatus.Archived, VotingStatus.Terminated]
    case VotingListFilter.All:
    case VotingListFilter.Own:
      return [
        VotingStatus.Pending,
        VotingStatus.Open,
        VotingStatus.Voted,
        VotingStatus.Counting,
        VotingStatus.Archived,
      ]

    default: {
      console.warn(
        typeof filter === 'undefined'
          ? 'You must provide a filter'
          : `Unknown filter: ${filter}`
      )
    }
  }
}
