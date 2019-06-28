import React, {useState, useEffect} from 'react'
import {margin, rem} from 'polished'
import Layout from '../../components/layout'
import {
  Box,
  Heading,
  SubHeading,
  Input,
  Label,
  Button,
} from '../../shared/components'
import theme from '../../shared/theme'
import nodeSettings from '../../screens/settings/shared/utils/node'
import {FlatButton} from '../../shared/components/button'
import Divider from '../../shared/components/divider'
import Flex from '../../shared/components/flex'
import Pre from '../../shared/components/pre'
import {NotificationContext} from '../../shared/providers/notification-provider'
import useFlips from '../../shared/utils/useFlips'
import {
  EpochProvider,
  useEpochState,
} from '../../shared/providers/epoch-context'

const DEFAULT_NODE_URL = 'http://localhost:9009'

const {clear: clearFlips} = global.flipStore || {}

export default function Settings() {
  const {archiveFlips} = useFlips()

  const {addNotification} = React.useContext(NotificationContext)

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
    <EpochProvider>
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
          <EpochDisplay />
        </Box>
      </Layout>
    </EpochProvider>
  )
}

function EpochDisplay() {
  const epoch = useEpochState()
  return <Pre>{JSON.stringify(epoch)}</Pre>
}
