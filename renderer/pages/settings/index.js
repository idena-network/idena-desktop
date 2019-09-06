import React, {useState, useEffect} from 'react'
import {margin, rem} from 'polished'

import Layout from '../../shared/components/layout'
import {
  Box,
  Heading,
  SubHeading,
  Input,
  Label,
  Button,
} from '../../shared/components'
import Link from '../../shared/components/link'
import theme from '../../shared/theme'
import {FlatButton} from '../../shared/components/button'
import Divider from '../../shared/components/divider'
import Flex from '../../shared/components/flex'
import Pre from '../../shared/components/pre'
import useFlips from '../../shared/utils/useFlips'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import {nodeSettings} from '../../shared/api/api-client'
import useRpc from '../../shared/hooks/use-rpc'
import {usePoll} from '../../shared/hooks/use-interval'

const DEFAULT_NODE_URL = 'http://localhost:9009'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()

  const addrRef = React.createRef()
  const [addr, setAddr] = useState()

  const handleSaveNodeAddr = () => {
    const nextAddr = addrRef.current.value
    setAddr(nextAddr)
    addNotification({
      title: 'Settings saved!',
      body: `Now running at ${nextAddr}`,
    })
  }

  useEffect(() => {
    if (addr) {
      nodeSettings.url = addr
    }
  }, [addr])

  return (
    <Layout>
      <Box padding={theme.spacings.normal}>
        <Heading>Settings</Heading>
        <Box>
          <SubHeading>Node settings</SubHeading>
          <Label htmlFor="url">Address</Label>
          <Flex align="center">
            <Input
              defaultValue={nodeSettings.url}
              value={addr}
              ref={addrRef}
              id="url"
              name="url"
              style={margin(0, theme.spacings.normal, 0, 0)}
            />
            <Button onClick={handleSaveNodeAddr}>Save</Button>
            <Divider vertical m={theme.spacings.small} />
            <FlatButton
              color={theme.colors.primary}
              onClick={() => {
                setAddr(DEFAULT_NODE_URL)
                addNotification({
                  title: 'Settings saved!',
                  body: `Now running at ${DEFAULT_NODE_URL}`,
                })
              }}
            >
              Use default
            </FlatButton>
          </Flex>
        </Box>
        {global.isDev && (
          <>
            <Box my={rem(theme.spacings.medium32)}>
              <SubHeading css={margin(0, 0, theme.spacings.small, 0)}>
                Flips
              </SubHeading>
              <Box>
                <Button
                  onClick={() => {
                    clearFlips()
                    addNotification({title: 'Flips deleted'})
                  }}
                >
                  Clear flips
                </Button>
              </Box>
              <Box my={theme.spacings.small}>
                <Button
                  onClick={() => {
                    archiveFlips()
                    addNotification({title: 'Flips archived'})
                  }}
                >
                  Archive flips
                </Button>
              </Box>
            </Box>
            <Box my={rem(theme.spacings.medium32)}>
              <SubHeading css={margin(0, 0, theme.spacings.small, 0)}>
                Invites
              </SubHeading>
              <Box my={theme.spacings.small}>
                <Button
                  onClick={() => {
                    inviteDb.clearInvites()
                    addNotification({title: 'Invites removed'})
                  }}
                >
                  Clear invites
                </Button>
              </Box>
            </Box>
            <Box my={rem(theme.spacings.medium32)}>
              <SubHeading css={margin(0, 0, theme.spacings.small, 0)}>
                Validation
              </SubHeading>
              <Box my={theme.spacings.small}>
                <Link href="/validation/short">Short</Link>
              </Box>
              <Box my={theme.spacings.small}>
                <Link href="/validation/long">Long</Link>
              </Box>
            </Box>
            <EpochDisplay />
          </>
        )}
      </Box>
    </Layout>
  )
}

function EpochDisplay() {
  const [{result}] = usePoll(useRpc('dna_epoch'), 3000)
  return <Pre>{JSON.stringify(result)}</Pre>
}

export default Settings
