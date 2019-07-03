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

  const {address} = useIdentityState()
  const {addNotification} = useNotificationDispatch()

  React.useEffect(() => {
    let ignore = false

    async function fetchData() {
      const txs = await Promise.all(
        savedInvites.map(({hash}) => hash).map(api.fetchTx)
      )
      // eslint-disable-next-line no-shadow
      const invites = savedInvites.map(invite => {
        const tx = txs.find(({hash}) => hash === invite.hash)
        return {
          ...invite,
          mined: tx && tx.result && tx.result.blockHash !== HASH_IN_MEMPOOL,
        }
      })
      if (!ignore) {
        setInvites(invites)
      }
    }

    const savedInvites = db.getInvites()
    fetchData()

    const savedActivationTx = db.getActivationTx()
    setActivationTx(savedActivationTx)

    return () => {
      ignore = true
    }
  }, [])

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
          .filter(({mined}) => !mined)
          .map(({hash}) => hash)
          .map(api.fetchTx)
      )
      setInvites(
        invites.map(invite => {
          const tx = txs.find(({hash}) => hash === invite.hash)
          if (tx) {
            return {
              ...invite,
              mined: tx && tx.result && tx.result.blockHash !== HASH_IN_MEMPOOL,
            }
          }
          return invite
        })
      )
    },
    invites.filter(({mined}) => !mined).length ? 5000 : null
  )

  const addInvite = async (to, amount, firstName = '', lastName = '') => {
    const {result, error} = await api.sendInvite({to, amount})
    if (result) {
      const invite = {amount, firstName, lastName, ...result}
      setInvites([...invites, invite])
      db.addInvite(invite)
    } else {
      throw new Error(error.message)
    }
  }

  const activateInvite = async code => {
    const {result, error} = await api.activateInvite(address, code)
    if (result) {
      setActivationTx(result)
      db.setActivationTx(result)
    } else {
      throw new Error(error.message)
    }
  }

  const resetActivation = () => {
    setActivationTx('')
    db.clearActivationTx()
  }

  return (
    <InviteStateContext.Provider value={{invites, activationTx}}>
      <InviteDispatchContext.Provider
        value={{addInvite, activateInvite, resetActivation}}
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
