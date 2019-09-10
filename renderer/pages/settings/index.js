import React from 'react'
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
import useFlips from '../../shared/utils/useFlips'
import {useNotificationDispatch} from '../../shared/providers/notification-context'
import usePersistentState from '../../shared/hooks/use-persistent-state'
import {nodeSettings} from '../../shared/api/api-client'

const DEFAULT_NODE_URL = 'http://localhost:9009'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()

  const [persistedUrl, setPersistedUrl] = usePersistentState(
    'settings',
    'url',
    DEFAULT_NODE_URL
  )

  const [url, setUrl] = React.useState(persistedUrl)
  const [modified, setModified] = React.useState()

  React.useEffect(() => {
    if (modified) {
      setPersistedUrl(url)
      nodeSettings.url = url
      addNotification({
        title: 'Settings saved!',
        body: `Now running at ${url}`,
      })
    }
    setModified(false)
  }, [addNotification, modified, setPersistedUrl, url])

  return (
    <Layout>
      <Box padding={theme.spacings.normal}>
        <Heading>Settings</Heading>
        <Box>
          <SubHeading>Node settings</SubHeading>
          <Label htmlFor="url">Address</Label>
          <Flex align="center">
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={margin(0, theme.spacings.normal, 0, 0)}
            />
            <Button onClick={() => setModified(Date.now())}>Save</Button>
            <Divider vertical m={theme.spacings.small} />
            <FlatButton
              color={theme.colors.primary}
              onClick={() => {
                setUrl(DEFAULT_NODE_URL)
                setModified(Date.now())
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
          </>
        )}
      </Box>
    </Layout>
  )
}

export default Settings
