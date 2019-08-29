/* eslint-disable no-use-before-define */
import React from 'react'
import * as api from '../api'
import {useInterval} from '../hooks/use-interval'
import {HASH_IN_MEMPOOL} from '../utils/tx'
import {useNotificationDispatch, NotificationType} from './notification-context'
import {useIdentityState} from './identity-context'

const db = global.invitesDb || {}

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

    async function fetchData() {
      const txs = await Promise.all(
        savedInvites.map(({hash}) => hash).map(api.fetchTx)
      )

      /*
      const invites = savedInvites
      .filter( ({hash}) => { //non activated invites only
        const invitee = invitees && invitees.find(({TxHash}) => TxHash === hash)
        return invitee==null
      })
*/

      const invites = savedInvites.map(invite => {
        // find out mining invite status
        const tx = txs.find(({hash}) => hash === invite.hash)
        const invitee =
          invitees && invitees.find(({TxHash}) => TxHash === invite.hash)
        const isMining =
          tx && tx.result && tx.result.blockHash === HASH_IN_MEMPOOL

        // TODO: remove dependency on saved state
        const nextInvite =
          !invite.activated && invitee != null // newly activated invite
            ? {
                ...invite,
                activated: true,
                canKill: true,
                receiver: invitee.Address,
              }
            : invite.activated && invitee == null // activated invite becomes verified or killed or exired
            ? {...invite, canKill: false}
            : {...invite}

        if (invitee != null) {
          // save changes if invitee is found
          db.updateInvite(invite.id, nextInvite)
        }

        return {
          ...nextInvite,
          dbkey: invite.id,
          mining: isMining,
        }
      })

      /*
      const allInvites = invitees==null ? invites : 
        invites.concat( invitees //add invites from idena node
          .map( invitee => {
            return {  
              firstName: '',
              lastName: '',
              activated: true,
              mining: false,
              hash: invitee.TxHash,
              receiver: invitee.Address,
              key: ''
            } 
          })
        )
*/
      const allInvites = invites
      if (!ignore) {
        setInvites(allInvites)
      }
    }

    const savedInvites = db.getInvites()
    fetchData()

    setActivationTx(db.getActivationTx())
    setActivationCode(db.getActivationCode())

    return () => {
      ignore = true
    }
  }, [invitees])

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
    activationTx ? 3000 : null
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
          const tx = txs.find(({hash}) => hash === invite.hash)
          if (tx) {
            return {
              ...invite,
              mining:
                tx && tx.result && tx.result.blockHash === HASH_IN_MEMPOOL,
            }
          }
          return invite
        })
      )
    },
    invites.filter(({mining}) => mining).length ? 5000 : null
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

      db.addInvite(saveInvite)
      const invite = {...saveInvite, mining: true}
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
      invites.map(invite => {
        if (invite.id == id) {
          return {
            ...invite,
            firstName: newFirstName,
            lastName: newLastName,
          }
        }
        return invite
      })
    )

    const invite = {id: key, firstName: newFirstName, lastName: newLastName}
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
        value={{addInvite, updateInvite, activateInvite, resetActivation}}
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
