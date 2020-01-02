/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {useEffect, useState} from 'react'
import {margin, rem} from 'polished'

import {Box, Input, Label, Button, Field, Text} from '../../shared/components'
import theme from '../../shared/theme'
import Flex from '../../shared/components/flex'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import SettingsLayout from './layout'
import {useChainState} from '../../shared/providers/chain-context'
import {getEnode, addPeer} from '../../shared/api/net'

function NodePeersSettings() {
  const {addNotification, addError} = useNotificationDispatch()

  const [enode, setEnode] = useState()
  const [peer, setPeer] = useState()

  useEffect(() => {
    let ignore = false

    async function fetchEnode() {
      const url = await getEnode()
      if (!ignore) {
        setEnode(url)
      }
    }
    fetchEnode()
    return () => {
      ignore = true
    }
  }, [])

  const {offline, loading} = useChainState()

  return (
    <SettingsLayout>
      <Box py={theme.spacings.xlarge}>
        <Text css={{marginBottom: 10}}>
          You can add a peer manually by specifying its address as following:
          <br />
          enode://...node id...@127.0.0.1:50505
        </Text>

        <Flex align="center">
          <Label htmlFor="url" style={{width: 80}}>
            Peer address
          </Label>
          <Input
            id="url"
            value={peer}
            onChange={e => setPeer(e.target.value)}
            style={{
              ...margin(0, theme.spacings.normal, 0, theme.spacings.small),
              width: rem(300),
            }}
          />
          <Button
            disabled={offline || loading || !peer}
            onClick={async () => {
              try {
                const url = peer
                const {error} = await addPeer(url)

                if (error) {
                  addError({
                    title: 'Error while adding the peer',
                    body: error.message,
                  })
                } else {
                  addNotification({
                    title: 'Peer has been added',
                    body: `Connecting... ${url}`,
                  })
                }
              } catch (error) {
                addError({
                  title: 'Something went wrong',
                  body: '',
                })
              }
            }}
          >
            Add
          </Button>
        </Flex>

        <Flex align="center" css={{marginTop: -15}}>
          <Label htmlFor="url" style={{width: 80, marginTop: 36}}>
            My node address
          </Label>

          <Field
            style={{width: rem(300), marginLeft: 6, marginTop: 2}}
            id="MyEnode"
            label=""
            defaultValue={enode}
            readonly
            disabled
            allowCopy
          />
        </Flex>
      </Box>
    </SettingsLayout>
  )
}

export default NodePeersSettings
