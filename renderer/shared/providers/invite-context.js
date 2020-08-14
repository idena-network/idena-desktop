/* eslint-disable no-use-before-define */
import React from 'react'
import * as api from '../api'
import {useInterval} from '../hooks/use-interval'
import {HASH_IN_MEMPOOL} from '../hooks/use-tx'
import {useNotificationDispatch, NotificationType} from './notification-context'
import {useIdentityState} from './identity-context'
import {IdentityStatus} from '../types'

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
      const txs = await Promise.all(
        savedInvites
          .filter(({activated, deletedAt}) => !activated && !deletedAt)
          .map(({hash}) => hash)
          .map(api.fetchTx)
      )

      const invitedIdentities = await Promise.all(
        savedInvites
          .filter(({deletedAt}) => !deletedAt)
          .map(({receiver}) => receiver)
          .map(api.fetchIdentity)
      )

      const inviteesIdentities =
        invitees &&
        (await Promise.all(
          invitees.map(({Address}) => Address).map(api.fetchIdentity)
        ))

      const terminateTxs = await Promise.all(
        savedInvites
          .filter(({terminateHash, deletedAt}) => terminateHash && !deletedAt)
          .map(({terminateHash}) => terminateHash)
          .map(api.fetchTx)
      )

      const nextInvites = savedInvites.map(invite => {
        // find out mining invite status
        const tx = txs.find(({hash}) => hash === invite.hash)

        // find invitee to kill
        const invitee =
          invitees && invitees.find(({TxHash}) => TxHash === invite.hash)

        // find invitee identity
        const inviteeIdentity =
          inviteesIdentities &&
          invitee &&
          inviteesIdentities.find(({address: addr}) => addr === invitee.Address)

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

      const allInvites = nextInvites
      if (!ignore) {
        setInvites(allInvites)
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
  }, [address, invitees])

  useInterval(
    async () => {
      const {result, error} = await api.fetchTx(activationTx)
      if (result) {
        const {blockHash} = result
        if (blockHash && blockHash !== HASH_IN_MEMPOOL) {
          resetActivation()
        }
      } else {
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
          .map(({hash}) => hash)
          .map(api.fetchTx)
      )
      setInvites(
        invites.map(invite => {
          const invitedIdentity = api.fetchIdentity(invite.receiver)

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
    },
    invites.filter(({mining}) => mining).length ? 1000 * 10 : null
  )

  useInterval(
    async () => {
      const txs = await Promise.all(
        invites
          .filter(({terminating}) => terminating)
          .map(({hash}) => hash)
          .map(api.fetchTx)
      )
      setInvites(
        invites.map(invite => {
          const invitedIdentity = api.fetchIdentity(invite.receiver)

          const tx = txs.find(({hash}) => hash === invite.hash)
          if (tx) {
            return {
              ...invite,
              terminating:
                invitedIdentity && invitedIdentity.state !== 'Undefined',
            }
          }
          return invite
        })
      )
    },
    invites.filter(({terminating}) => terminating).length ? 1000 * 10 : null
  )

  const addInvite = async (to, amount, firstName = '', lastName = '') => {
    const {result, error} = await api.sendInvite({to, amount})
    if (result) {
      const saveInvite = {
        amount,
        firstName,
        lastName,
        ...result,
        activated: false,
        canKill: true,
      }

      const id = db.addInvite(saveInvite)
      const invite = {...saveInvite, id, mining: true}
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
    const key = id
    setInvites(
      invites.map(inv => {
        if (inv.id === id) {
          return {
            ...inv,
            deletedAt: Date.now(),
          }
        }
        return inv
      })
    )
    const invite = {id: key, deletedAt: Date.now()}
    db.updateInvite(id, invite)
  }

  const killInvite = async (id, myAddress, inviteeAddress) => {
    const from = myAddress
    const to = inviteeAddress
    const resp = await api.killInvitee(from, to)
    const {result} = resp

    if (result) {
      const key = id
      setInvites(
        invites.map(inv => {
          if (inv.id === id) {
            return {
              ...inv,
              terminating: true,
            }
          }
          return inv
        })
      )
      const invite = {id: key, terminateHash: result, terminatedAt: Date.now()}
      db.updateInvite(id, invite)
    }
    return resp
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
    const {result, error} = await api.activateInvite(address, code)
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

export {InviteProvider, useInviteState, useInviteDispatch}
