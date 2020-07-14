import dayjs from 'dayjs'
import {assign} from 'xstate'
import {VotingStatus} from '../../shared/types'
import {callRpc, toLocaleDna} from '../../shared/utils/utils'
import {strip} from '../../shared/utils/obj'
import {ContractRpcMode, VotingListFilter} from './types'

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
  return `http://95.216.138.96:18888/api/${path}`
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

  const queryParams = {limit, all: all.toString(), oracle, ...params}

  Object.entries(queryParams)
    .filter(([, v]) => Boolean(v))
    .forEach(([k, v]) => {
      url.searchParams.append(k, v)
    })

  const {result, error, continuationToken} = await (await fetch(url)).json()

  if (error) throw new Error(error.message)

  return {result, continuationToken}
}

export async function fetchOracleRewardsEstimates(committeeSize) {
  const {result, error} = await (
    await fetch(
      apiUrl(
        `OracleVotingContracts/EstimatedOracleRewards?committeeSize=${committeeSize}`
      )
    )
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

export async function fetchVoting({id, contractHash = id, address}) {
  const {result, error} = await (
    await fetch(
      apiUrl(`OracleVotingContract/${contractHash}?oracle=${address}`)
    )
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
  try {
    return JSON.parse(
      new TextDecoder().decode(Buffer.from(hex.substring(2), 'hex'))
    )
  } catch {
    return {}
  }
}

export function buildContractDeploymentArgs(
  {
    title,
    desc,
    startDate,
    votingDuration,
    publicVotingDuration,
    winnerThreshold = 66,
    quorum,
    committeeSize,
    votingMinPayment = 0,
    options = [],
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
          options: stripOptions(options),
        })}`,
      },
      {
        value: dayjs(shouldStartImmediately ? Date.now() : startDate).unix(),
        format: 'uint64',
      },
      {value: votingDuration, format: 'uint64'},
      {value: publicVotingDuration, format: 'uint64'},
      {value: winnerThreshold, format: 'byte'},
      {value: quorum, format: 'byte'},
      {value: committeeSize, format: 'uint64'},
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

export function winnerVotesCount({winnerThreshold, votesCount}) {
  return Math.ceil((votesCount * winnerThreshold) / 100)
}

export function hasQuorum({votesCount, quorum, committeeSize}) {
  const requiredVotesCount = quorumVotesCount({quorum, committeeSize})
  return votesCount >= requiredVotesCount
}

export function hasWinner({
  votes = [],
  votesCount,
  winnerThreshold,
  quorum,
  committeeSize,
  finishCountingDate,
}) {
  const requiredVotesCountByVotes = winnerVotesCount({
    winnerThreshold,
    votesCount,
  })

  const requiredVotesCountByCommittee = winnerVotesCount({
    winnerThreshold,
    votesCount: committeeSize,
  })

  const didReachQuorum = hasQuorum({votesCount, quorum, committeeSize})

  return dayjs().isBefore(finishCountingDate)
    ? votes.some(({count}) => count >= requiredVotesCountByCommittee)
    : votes.some(
        ({count}) => count >= requiredVotesCountByVotes && didReachQuorum
      )
}

export function minOracleReward(feePerGas) {
  return dnaFeePerGas(feePerGas) * 100 * 100
}

export function votingMinStake(feePerGas) {
  return 3000000 * dnaFeePerGas(feePerGas)
}

// eslint-disable-next-line no-shadow
export function votingMinBalance({oracleReward, committeeSize}) {
  return oracleReward * committeeSize
}

function dnaFeePerGas(value) {
  return value * 10 ** -18
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

export function blocksPerInterval({
  weeks,
  days = weeks * 7,
  hours = days * 24,
}) {
  return Math.round((hours * 60 * 60) / 20)
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
        VotingStatus.Terminated,
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

export const humanizeDuration = duration =>
  dayjs.duration(duration * BLOCK_TIME, 's').humanize()

export const humanError = (
  error,
  {
    startDate,
    balance,
    // eslint-disable-next-line no-shadow
    minOracleReward,
    // eslint-disable-next-line no-shadow
    oracleReward,
    committeeSize,
    votingMinPayment,
  },
  locale = global.locale
) => {
  const dna = toLocaleDna(locale)

  switch (error) {
    case 'no value':
      return 'Invalid parameter when calling smart contract method'
    case 'contract is not in pending state':
      return 'Voting has already started'
    case 'starting is locked':
      return `Cannot start the voting before specific time: ${new Date(
        startDate
      ).toLocaleString()}`
    case 'contract balance is less than minimal oracles reward': {
      const requiredBalance = votingMinBalance({
        oracleReward: Math.max(oracleReward, minOracleReward),
        committeeSize,
      })
      return `Insufficient funds to start the voting. Minimum deposit is required: ${dna(
        requiredBalance
      )}. Current balance: ${dna(balance)}.`
    }
    case 'sender is not identity':
      return 'Your address cannot vote'
    case 'voting should be prolonged':
      return 'The voting must be prolonged since a new epoch has started'
    case 'contract is not in running state':
      return 'Voting has not started yet'
    case 'sender has voted already':
      return 'Your address has already voted.'
    case 'too late to accept secret vote':
      return 'Cannot vote. Voting is finished.'
    case 'tx amount is less than voting minimal payment':
      return `Cannot vote. Transaction amount is less than the required minimum deposit: ${dna(
        votingMinPayment
      )}`
    case 'invalid proof':
      return 'Your address is not selected for the voting'
    case 'too early to accept open vote':
      return 'Cannot publish the vote yet'
    case 'too late to accept open vote':
      return 'Cannot publish the vote. Voting is finished.'
    case 'wrong vote hash':
      return 'Invalid vote hash'
    case 'not enough votes to finish voting':
      return 'Not enough votes to finish the voting'
    case 'voting can not be prolonged':
      return 'The voting cannot be prolonged'
    case 'voting can not be terminated':
      return 'The voting cannot be terminated'
    case 'insufficient funds':
      return 'Not enough funds to vote'
    default:
      return error
  }
}

export const isAllowedToTerminate = ({estimatedTerminationTime}) =>
  estimatedTerminationTime && dayjs().isAfter(estimatedTerminationTime)

export function stripOptions(options) {
  return options.filter(({value}) => Boolean(value))
}

export function hasValuableOptions(options) {
  return stripOptions(options).length > 0
}

export const mapVoting = ({
  contractAddress,
  author,
  fact,
  state,
  createTime,
  startTime,
  estimatedVotingFinishTime,
  estimatedPublicVotingFinishTime,
  votingFinishTime,
  publicVotingFinishTime,
  minPayment,
  ...voting
}) => ({
  ...voting,
  id: contractAddress,
  contractHash: contractAddress,
  issuer: author,
  status: state,
  createDate: createTime,
  startDate: startTime,
  finishDate: estimatedVotingFinishTime || votingFinishTime,
  finishCountingDate: estimatedPublicVotingFinishTime || publicVotingFinishTime,
  votingMinPayment: minPayment,
  ...hexToObject(fact),
})

export function mapVotingStatus(status) {
  return areSameCaseInsensitive(status, VotingStatus.Voted) ? 'Voting' : status
}
