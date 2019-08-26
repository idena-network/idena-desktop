import React, {useState, useEffect} from 'react'
import {
  Box,
  BlockHeading,
  FormGroup,
  Label,
  Switcher,
  Modal,
  Input,
  Button,
  SubHeading,
  Text,
} from '../../../shared/components'
import Flex from '../../../shared/components/flex'
import theme from '../../../shared/theme'
import useTx from '../../../shared/hooks/use-tx'
import useRpc from '../../../shared/hooks/use-rpc'
import {useIdentityState} from '../../../shared/providers/identity-context'

// eslint-disable-next-line react/prop-types
function MinerStatusSwitcher() {
  const identity = useIdentityState()

  const [{result: hash}, callRpc] = useRpc()
  const [{mined}, setHash] = useTx()

  const [state, dispatch] = React.useReducer(
    (state, [action, identity]) => {
      switch (action) {
        case 'init': {
          return {
            ...state,
            miner: identity.online,
          }
        }
        case 'open': {
          return {
            ...state,
            showModal: true,
          }
        }
        case 'close': {
          return {
            ...state,
            showModal: false,
          }
        }
        case 'toggle':
          return {
            ...state,
            mining: true,
          }
        case 'mined': {
          return {
            ...state,
            mining: false,
            showModal: false,
            miner: identity.online,
          }
        }
        default:
          return state
      }
    },
    {
      miner: null,
      showModal: false,
      mining: false,
    }
  )

  useEffect(() => {
    if (identity) {
      dispatch(['init', identity])
    }
  }, [identity])

  useEffect(() => {
    setHash(hash)
  }, [hash, setHash])

  useEffect(() => {
    if (mined) {
      dispatch(['mined', identity])
    }
  }, [identity, mined])

  if (!identity || !identity.canMine || state.miner === null) {
    return null
  }

  return (
    <Box m="0 0 24px 0">
      <FormGroup onClick={() => dispatch(['open'])}>
        <BlockHeading>Status</BlockHeading>
        <div className="form-control">
          <Flex align="center" justify="space-between">
            <Label htmlFor="switcher" style={{margin: 0, cursor: 'pointer'}}>
              Miner
            </Label>
            <Box style={{pointerEvents: 'none'}}>
              <Switcher withStatusHint isChecked={state.miner} />
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
            &quot;Miner&quot; mode {!state.miner ? 'on' : 'off'}
          </SubHeading>
          <Text>
            {!state.miner ? (
              <span>Switch the node to the &quot;Miner&quot; mode.</span>
            ) : (
              <span>Switch off the &quot;Miner&quot; mode.</span>
            )}
          </Text>
        </Box>
        <form>
          <FormGroup m="0 0 24px">
            <Label htmlFor="fee">Fee, DNA</Label>
            <Input name="fee" value="123" disabled />
          </FormGroup>
        </form>
        <Flex align="center" justify="flex-end">
          <Box px="4px">
            <Button variant="secondary" onClick={() => dispatch(['close'])}>
              Cancel
            </Button>
          </Box>
          <Box px="4px">
            <Button
              onClick={() => {
                dispatch(['toggle'])
                callRpc(
                  state.miner ? 'dna_becomeOffline' : 'dna_becomeOnline',
                  {}
                )
              }}
              disabled={state.mining}
            >
              {state.mining ? 'Mining...' : 'Submit'}
            </Button>
          </Box>
        </Flex>
      </Modal>
    </Box>
  )
}

export default MinerStatusSwitcher
