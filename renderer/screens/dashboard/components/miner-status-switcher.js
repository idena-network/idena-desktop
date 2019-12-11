import React, {useEffect, useReducer} from 'react'
import {useTranslation} from 'react-i18next'

import {
  Box,
  FormGroup,
  Label,
  Switcher,
  Modal,
  Button,
  SubHeading,
  Text,
} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import useTx from '../../../shared/hooks/use-tx'
import useRpc from '../../../shared/hooks/use-rpc'
import {useIdentityState} from '../../../shared/providers/identity-context'
import {useNotificationDispatch} from '../../../shared/providers/notification-context'

const defaultState = {
  online: null,
  showModal: false,
  isMining: false,
}

function miningReducer(state, [action, {online} = defaultState]) {
  switch (action) {
    case 'init':
      return {
        ...state,
        online,
      }
    case 'open':
      return {
        ...state,
        showModal: true,
      }
    case 'close':
      return {
        ...state,
        showModal: false,
      }

    case 'toggle':
      return {
        ...state,
        isMining: true,
      }
    case 'mined':
      return {
        ...state,
        isMining: false,
        showModal: false,
      }
    case 'error':
      return {
        ...state,
        showModal: false,
        isMining: false,
      }
    default:
      return state
  }
}

function MinerStatusSwitcher() {
  const identity = useIdentityState()
  const {addError} = useNotificationDispatch()

  const [{result: hash, error}, callRpc] = useRpc()
  const [{mined}, setHash] = useTx()

  const [state, dispatch] = useReducer(miningReducer, defaultState)

  useEffect(() => {
    if (!state.showModal) {
      dispatch(['init', identity])
    }
  }, [identity, state.showModal])

  useEffect(() => setHash(hash), [hash, setHash])

  useEffect(() => {
    if (error) {
      dispatch(['error'])
      addError({title: error.message})
    }
  }, [addError, error])

  useEffect(() => {
    if (mined) {
      dispatch(['mined'])
    }
  }, [mined])

  const {t} = useTranslation()

  if (!identity.canMine) {
    return null
  }

  return (
    <Box m="0 0 24px 0">
      <FormGroup onClick={() => dispatch(['open'])}>
        <div className="form-control">
          <Flex align="center" justify="space-between">
            <Label htmlFor="switcher" style={{margin: 0, cursor: 'pointer'}}>
              {t('Online mining status')}
            </Label>
            <Box style={{pointerEvents: 'none'}}>
              {state.online !== null && state.online !== undefined && (
                <Switcher
                  withStatusHint
                  isChecked={state.online}
                  isInProgress={state.isMining}
                  bgOff={theme.colors.danger}
                  bgOn={theme.colors.primary}
                />
              )}
            </Box>
          </Flex>
        </div>
        <style jsx>{`
          .form-control {
            border: solid 1px ${theme.colors.gray2};
            color: ${theme.colors.input};
            background: ${theme.colors.white};
            border-radius: 6px;
            font-size: 1em;
            padding: 0.5em 1em 0.65em;
            cursor: pointer;
          }
        `}</style>
      </FormGroup>
      <Modal show={state.showModal} onHide={() => dispatch(['close'])}>
        <Box m="0 0 18px">
          <SubHeading>
            {!state.online
              ? t('Activate mining status')
              : t('Deactivate mining status')}
          </SubHeading>
          <Text>
            {!state.online ? (
              <span>
                {t(`Submit the form to start mining. Your node has to be online
                unless you deactivate your status. Otherwise penalties might be
                charged after being offline more than 1 hour.`)}
                <br />
                <br />
                {t('You can deactivate your online status at any time.')}
              </span>
            ) : (
              <span>
                {t('Submit the form to deactivate your mining status.')}
                <br />
                <br />
                (t{'You can activate it again afterwards.'})
              </span>
            )}
          </Text>
        </Box>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button variant="secondary" onClick={() => dispatch(['close'])}>
              {t('Cancel')}
            </Button>
          </Box>
          <Box px="4px">
            <Button
              onClick={() => {
                dispatch(['toggle'])
                callRpc(
                  state.online ? 'dna_becomeOffline' : 'dna_becomeOnline',
                  {}
                )
              }}
              disabled={state.isMining}
            >
              {state.isMining ? t('Waiting...') : t('Submit')}
            </Button>
          </Box>
        </Flex>
      </Modal>
    </Box>
  )
}

export default MinerStatusSwitcher
