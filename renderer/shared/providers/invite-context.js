/* eslint-disable no-use-before-define */
import React from 'react'
import * as api from '../api'
import useCoinbaseAddress from '../utils/useCoinbaseAddress'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {HASH_IN_MEMPOOL} from '../utils/tx'

const db = global.invitesDb || {}

const InviteStateContext = React.createContext()
const InviteDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function InviteProvider({children}) {
  const [invites, setInvites] = React.useState([])
  const [activationTx, setActivationTx] = React.useState()

  React.useEffect(() => {
    const savedInvites = db.getInvites()
    setInvites(savedInvites)
  }, [])

  const address = useCoinbaseAddress()

  useInterval(
    async () => {
      const {result} = api.fetchTx(activationTx)
      if (result) {
        const {hash} = result
        if (hash && hash !== HASH_IN_MEMPOOL) {
          resetActivation()
        }
      } else {
        resetActivation()
      }
    },
    activationTx ? 3000 : null
  )

  const addInvite = async (to, amount) => {
    let invite = {to, amount}
    const {result, error} = await api.sendInvite(invite)
    if (result) {
      invite = {...invite, ...result}
      setInvites([...invites, invite])
      db.addInvite(invite)
    } else {
      throw new Error(error.message)
    }
  }

  const activateInvite = async code => {
    const result = await api.activateInvite(address, code)
    const {error} = result
    if (error) {
      throw new Error(error.message)
    } else {
      setActivationTx(result)
      db.setActivationTx(result)
    }
  }

  const getLastInvite = () => invites[invites.length - 1]

  const resetActivation = () => {
    setActivationTx('')
    db.clearActivationTx()
  }

  return (
    <InviteStateContext.Provider value={{invites, activationTx}}>
      <InviteDispatchContext.Provider
        value={{addInvite, activateInvite, resetActivation, getLastInvite}}
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
