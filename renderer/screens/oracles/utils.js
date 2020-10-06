import dayjs from 'dayjs'
import {assign} from 'xstate'
import {VotingStatus} from '../../shared/types'
import {callRpc} from '../../shared/utils/utils'
import {strip as omit} from '../../shared/utils/obj'

export const ContractRpcMode = {
  Estimate: 'estimate',
  Call: 'call',
}

export function resolveVotingStatus({status, startDate, vote}) {
  if (status !== VotingStatus.Running)
    return startDate ? VotingStatus.Pending : VotingStatus.Invalid
  return vote ? VotingStatus.Voted : VotingStatus.Running
}

export const ensureVotingStatus = targetStatus => ({status, ...voting}) =>
  status === targetStatus ||
  resolveVotingStatus(voting) === VotingStatus.Pending

export const isVotingStatus = targetStatus => ({status}) =>
  status === targetStatus

export const isVotingMiningStatus = targetStatus => ({status, txHash}) =>
  status === targetStatus && Boolean(txHash)

export const eitherStatus = (...statuses) => ({status}) =>
  statuses.some(s => s === status)

export const setVotingStatus = status =>
  assign({
    prevStatus: ({status: currentStatus}) => currentStatus,
    status,
  })

export async function fetchVotings({limit = 10, ...params}) {
  const invokeUrl = new URL(`https://api.idena.io/api/OracleVotingContracts`)

  Object.entries({limit, ...params})
    .filter(([, v]) => Boolean(v))
    .forEach(([k, v]) => {
      invokeUrl.searchParams.append(k, v)
    })

  const {result, error} = await (await fetch(invokeUrl)).json()

  if (error) throw new Error(error.message)

  return result || []
}

export const createContractCaller = ({
  issuer,
  contractHash,
  votingMinPayment,
  gasCost,
  txFee,
  amount,
  broadcastBlock,
}) => (method, mode = ContractRpcMode.Call, ...args) => {
  const isCalling = mode === ContractRpcMode.Call

  const payload = omit({
    from: issuer,
    contract: contractHash,
    method,
    amount: amount || votingMinPayment,
    maxFee: isCalling ? contractDeploymentMaxFee(gasCost, txFee) : null,
    broadcastBlock: isCalling ? broadcastBlock : null,
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
    omit({
      contract: contractHash,
      method,
      format,
      args: buildDynamicArgs(...args),
    })
  )

export const createContractDataReader = ({contractHash}) => (key, format) =>
  callRpc('contract_readData', contractHash, key, format)

export function objectToHex(obj) {
  return Buffer.from(new TextEncoder().encode(JSON.stringify(obj))).toString(
    'hex'
  )
}

export function stringToHex(str) {
  return Buffer.from(new TextEncoder().encode(str)).toString('hex')
}

export function hexToObject(hex) {
  return new TextDecoder().decode(Buffer.from(hex, 'hex'))
}

export function buildContractDeploymentParams(
  {
    title,
    desc,
    options,
    startDate,
    gasCost,
    txFee,
    votingDuration,
    publicVotingDuration,
    winnerThreshold,
    quorum,
    committeeSize,
    maxOptions,
    votingMinPayment = 0,
    ownerFee = 0,
    shouldStartImmediately,
  },
  {address: from},
  mode = ContractRpcMode.Call
) {
  return omit({
    from,
    codeHash: '0x02',
    amount: 6001,
    maxFee:
      mode === ContractRpcMode.Call
        ? contractDeploymentMaxFee(gasCost, txFee)
        : null,
    args: buildDynamicArgs(
      {
        value: `0x${objectToHex({
          title,
          desc,
          options,
        })}`,
      },
      {
        value: dayjs(shouldStartImmediately ? Date.now() : startDate)
          .unix()
          .toString(),
        format: 'uint64',
      },
      {value: votingDuration, format: 'uint64'},
      {value: publicVotingDuration, format: 'uint64'},
      {value: winnerThreshold, format: 'uint64'},
      {value: quorum, format: 'uint64'},
      {value: committeeSize, format: 'uint64'},
      {value: maxOptions, format: 'uint64'},
      {value: votingMinPayment, format: 'bigint'},
      {value: ownerFee, format: 'byte'}
    ),
  })
}

export function buildDynamicArgs(...args) {
  return args
    .map(({format = 'hex', ...arg}, index) => ({index, format, ...arg}))
    .filter(({value}) => Boolean(value))
}

export function contractDeploymentMaxFee(gasCost, txFee) {
  return Math.ceil((gasCost + txFee) * 1.1)
}

export const BLOCK_TIME = 20
const defaultVotingDuration = 4320

export const votingFinishDate = ({
  startDate,
  votingDuration = defaultVotingDuration,
  pubicVotingDuration = defaultVotingDuration,
}) =>
  dayjs(startDate)
    .add(votingDuration * BLOCK_TIME, 's')
    .add(pubicVotingDuration * BLOCK_TIME, 's')

export function viewVotingHref(id) {
  return `/oracles/view?id=${id}`
}
