/* eslint-disable no-use-before-define */
import React from 'react'
import {useInterval} from '../hooks/use-interval'
import {HASH_IN_MEMPOOL, callRpc} from '../utils/utils'
import {useNotificationDispatch, NotificationType} from './notification-context'
import {useIdentityState} from './identity-context'
import {IdentityStatus} from '../types'
import {fetchIdentity, killInvitee, sendInvite} from '../api/dna'

const db = global.invitesDb || {}

const killableIdentities = [IdentityStatus.Newbie, IdentityStatus.Candidate]

const InviteStateContext = React.createContext()
const InviteDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function InviteProvider({children}) {
  const [invites, setInvites] = React.useState([])
  const [activationTx, setActivationTx] = React.useState()
  const [activationCode, setActivationCode] = React.useState()

  const {address, invitees} = useIdentityState()
  const {addNotification} = useNotificationDispatch()

  React.useEffect(() => {
    let ignore = false

    async function fetchData(savedInvites) {
      const txs = (
        await Promise.all(
          savedInvites
            .filter(({activated, deletedAt}) => !activated && !deletedAt)
            .map(({hash}) => callRpc('bcn_transaction', hash).catch(() => null))
        )
      ).filter(Boolean)

      const invitedIdentities = await Promise.all(
        savedInvites
          .filter(({deletedAt}) => !deletedAt)
          .map(({receiver}) => receiver)
          .map(fetchIdentity)
      )

      const inviteesIdentities = await Promise.all(
        (invitees ?? []).map(({Address}) => Address).map(fetchIdentity)
      )

      const terminateTxs = await Promise.all(
        savedInvites
          .filter(({terminateHash, deletedAt}) => terminateHash && !deletedAt)
          .map(({terminateHash}) =>
            callRpc('bcn_transaction', terminateHash).then(tx => ({
              hash: terminateHash,
              ...tx,
            }))
          )
      )

      const nextInvites = savedInvites.map(invite => {
        // find out mining invite status
        const tx = txs.find(({hash}) => hash === invite.hash)

        // find invitee to kill
        const invitee = invitees?.find(({TxHash}) => TxHash === invite.hash)

        // find invitee identity
        const inviteeIdentity = inviteesIdentities?.find(
          ({address: addr}) => addr === invitee?.Address
        )

        // find all identities/invites
        const invitedIdentity =
          inviteeIdentity ||
          invitedIdentities.find(({address: addr}) => addr === invite.receiver)

        // becomes activated once invitee is found
        const isNewInviteActivated = !!invitee

        const canKill =
          !!invitee &&
          !!invitedIdentity &&
          killableIdentities.includes(invitedIdentity.state)

        const isMining =
          tx && tx.result && tx.result.blockHash === HASH_IN_MEMPOOL

        const terminateTx =
          terminateTxs &&
          terminateTxs.find(({hash}) => hash === invite.terminateHash)

        const isTerminating =
          terminateTx &&
          terminateTx.result &&
          terminateTx.result.blockHash === HASH_IN_MEMPOOL

        const nextInvite = {
          ...invite,
          activated: invite.activated || isNewInviteActivated,
          canKill,
          receiver: isNewInviteActivated ? invitee.Address : invite.receiver,
        }

        if (isNewInviteActivated) {
          // save changes once invitee is found
          db.updateInvite(invite.id, nextInvite)
        }

        return {
          ...nextInvite,
          dbkey: invite.id,
          mining: isMining,
          terminating: isTerminating,
          identity: invitedIdentity,
        }
      })

      if (!ignore) {
        setInvites(nextInvites)
      }
    }

    fetchData(db.getInvites()).catch(e => {
      global.logger.error('An error occured while fetching identity', e.message)
    })

    setActivationTx(db.getActivationTx())
    setActivationCode(db.getActivationCode())

    return () => {
      ignore = true
    }
  }, [invitees])

  useInterval(
    async () => {
      try {
        const {blockHash} = await callRpc('bcn_transaction', activationTx)
        if (blockHash !== HASH_IN_MEMPOOL) resetActivation()
      } catch (error) {
        resetActivation()
        addNotification({
          title: error
            ? error.message
            : 'Activation failed. Tx no longer exists',
          type: NotificationType.Error,
        })
      }
    },
    activationTx ? 1000 * 10 : null
  )

  useInterval(
    async () => {
      const txs = await Promise.all(
        invites
          .filter(({mining}) => mining)
          .map(({hash}) =>
            callRpc('bcn_transaction', hash).then(tx => ({hash, ...tx}))
          )
      )
      setInvites(
        await Promise.all(
          invites.map(async invite => {
            const invitedIdentity = await callRpc(
              'dna_identity',
              invite.receiver
            )

            const tx = txs.find(({hash}) => hash === invite.hash)
            if (tx) {
              return {
                ...invite,
                identity: invitedIdentity,
                mining:
                  tx && tx.result && tx.result.blockHash === HASH_IN_MEMPOOL,
              }
            }
            return invite
          })
        )
      )
    },
    invites.filter(({mining}) => mining).length ? 1000 * 10 : null
  )

  useInterval(
    async () => {
      const txs = await Promise.all(
        invites
          .filter(({terminating}) => terminating)
          .map(({hash}) =>
            callRpc('bcn_transaction', hash).then(tx => ({hash, ...tx}))
          )
      )

      setInvites(
        await Promise.all(
          invites.map(async invite => {
            const invitedIdentity = await callRpc(
              'dna_identity',
              invite.receiver
            )

            const tx = txs.find(({hash}) => hash === invite.hash)

            const isTerminating =
              invitedIdentity?.state !== IdentityStatus.Undefined

            return tx
              ? {
                  ...invite,
                  identity: invitedIdentity,
                  state: isTerminating
                    ? IdentityStatus.Terminating
                    : invitedIdentity?.state,
                  terminating: isTerminating,
                  canKill:
                    invite &&
                    invitedIdentity &&
                    killableIdentities.includes(invitedIdentity.state),
                }
              : invite
          })
        )
      )
    },
    invites.filter(({terminating}) => terminating).length ? 1000 * 10 : null
  )

  const addInvite = async (to, amount, firstName = '', lastName = '') => {
    const {result, error} = await sendInvite({to, amount})
    if (result) {
      const issuedInvite = {
        amount,
        firstName,
        lastName,
        ...result,
        activated: false,
        canKill: true,
      }

      const id = db.addInvite(issuedInvite)
      const invite = {...issuedInvite, id, mining: true}
      setInvites([...invites, invite])

      return invite
    }
    throw new Error(error.message)
  }

  const updateInvite = async (id, firstName, lastName) => {
    const key = id
    const newFirstName = firstName || ''
    const newLastName = lastName || ''

    setInvites(
      invites.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            firstName: newFirstName,
            lastName: newLastName,
          }
        }
        return inv
      })
    )

    const invite = {id: key, firstName: newFirstName, lastName: newLastName}
    db.updateInvite(id, invite)
  }

  const deleteInvite = async id => {
    const deletedAt = Date.now()
    setInvites(
      invites.map(currentInvite =>
        currentInvite.id === id ? {...currentInvite, deletedAt} : currentInvite
      )
    )
    db.updateInvite(id, {id, deletedAt})
  }

  const killInvite = async (id, from, to) => {
    const {result, error} = await killInvitee(from, to)

    if (result) {
      setInvites(
        // eslint-disable-next-line no-shadow
        invites.map(invite =>
          invite.id === id
            ? {
                ...invite,
                terminating: true,
                state: IdentityStatus.Terminating,
                canKill: false,
              }
            : invite
        )
      )
      const invite = {id, terminateHash: result, terminatedAt: Date.now()}
      db.updateInvite(id, invite)
    }

    return {result, error}
  }

  const recoverInvite = async id => {
    const key = id

    setInvites(
      invites.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            deletedAt: null,
          }
        }
        return inv
      })
    )
    const invite = {id: key, deletedAt: null}
    db.updateInvite(id, invite)
  }

  const activateInvite = async code => {
    const {result, error} = await activateInvite(address, code)
    if (result) {
      setActivationTx(result)
      db.setActivationTx(result)
      if (code) {
        setActivationCode(code)
        db.setActivationCode(code)
      }
    } else {
      throw new Error(error.message)
    }
  }

  const resetActivation = () => {
    setActivationTx('')
    db.clearActivationTx()
    setActivationCode('')
    db.clearActivationCode()
  }

  return (
    <InviteStateContext.Provider
      value={{invites, activationTx, activationCode}}
    >
      <InviteDispatchContext.Provider
        value={{
          addInvite,
          updateInvite,
          deleteInvite,
          recoverInvite,
          activateInvite,
          resetActivation,
          killInvite,
        }}
      >
        {children}
      </InviteDispatchContext.Provider>
    </InviteStateContext.Provider>
  )
}

function useInviteState() {
  const context = React.useContext(InviteStateContext)
  if (context === undefined) {
    throw new Error('useInviteState must be used within a InviteProvider')
  }
  return context
}

function useInviteDispatch() {
  const context = React.useContext(InviteDispatchContext)
  if (context === undefined) {
    throw new Error('useInviteDispatch must be used within a InviteProvider')
  }
  return context
}

export function useInvite() {
  return [useInviteState(), useInviteDispatch()]
}

export {InviteProvider, useInviteState, useInviteDispatch}
