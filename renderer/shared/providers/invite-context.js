/* eslint-disable no-use-before-define */
import React from 'react'
import * as api from '../api'
import useCoinbaseAddress from '../utils/useCoinbaseAddress'
import {useInterval} from '../../screens/validation/shared/utils/useInterval'
import {HASH_IN_MEMPOOL} from '../utils/tx'

const db = global.inviteDb || {}

const InviteStateContext = React.createContext()
const InviteDispatchContext = React.createContext()

// eslint-disable-next-line react/prop-types
function InviteProvider({children}) {
  const [invites, setInvites] = React.useState([])
  const [activationCode, setActivationCode] = React.useState()
  const [activationTx, setActivationTx] = React.useState()

  React.useEffect(() => {
    const savedInvites = db.getInvites()
    setInvites(savedInvites)

    const code = db.getActivationCode()
    if (code) {
      setActivationCode(code)
    }
  }, [])

  const address = useCoinbaseAddress()

  useInterval(
    async () => {
      const {hash: inviteHash} = getLastInvite()
      const {result: inviteResult} = await api.fetchTx(inviteHash)
      if (inviteResult) {
        if (inviteResult.blockHash !== HASH_IN_MEMPOOL) {
          const {result: activateResult} = await api.activateInvite(
            address,
            activationCode
          )
          if (activateResult) {
            const {hash: activateHash} = activateResult
            setActivationTx(activateHash)
            db.setActivationTx(activateHash)
          } else {
            resetActivation()
          }
        }
      } else {
        resetActivation()
      }
    },
    activationCode && !activationTx ? 3000 : null
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
    setActivationCode(code)
    db.setActivationCode(code)
  }

  const getLastInvite = () => invites[invites.length - 1]

  const resetActivation = () => {
    setActivationCode('')
    db.clearActivationCode()
    setActivationTx('')
    db.clearActivationTx()
  }

  return (
    <InviteStateContext.Provider
      value={{invites, activationCode, activationTx}}
    >
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
