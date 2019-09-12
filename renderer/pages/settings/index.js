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
import {usePersistence} from '../../shared/hooks/use-persistent-state'
import {BASE_API_URL} from '../../shared/api/api-client'

const {clear: clearFlips} = global.flipStore || {}
const inviteDb = global.invitesDb || {}

function Settings() {
  const {archiveFlips} = useFlips()
  const {addNotification} = useNotificationDispatch()

  const [state, dispatch] = usePersistence(
    React.useReducer(
      // eslint-disable-next-line no-shadow
      (state, [type, url]) => {
        switch (type) {
          case 'url/reset':
            return {...state, isSaved: false}
          case 'url/change':
            return {...state, url, isSaved: false}
          case 'url/save':
            return {...state, isSaved: true}
          default:
            return state
        }
      },
      {
        url: BASE_API_URL,
        isSaved: false,
      }
    ),
    'settings',
    ['url/save', 'url/reset']
  )

  React.useEffect(() => {
    if (state.isSaved) {
      addNotification({
        title: 'Settings updated',
        body: `Connected to ${state.url}`,
      })
      dispatch(['url/reset'])
    }
  }, [addNotification, dispatch, state.isSaved, state.url])

  return (
    <Layout>
      <Box padding={theme.spacings.normal}>
        <Heading>Settings</Heading>
        <Box>
          <SubHeading>Node settings</SubHeading>
          <Label htmlFor="url">Address</Label>
          <Flex align="center">
            <Input
              value={state.url}
              onChange={e => dispatch(['url/change', e.target.value])}
              style={{
                ...margin(0, theme.spacings.normal, 0, 0),
                width: rem(300),
              }}
            />
            <Button onClick={() => dispatch(['url/save'])}>Save</Button>
            <Divider vertical m={theme.spacings.small} />
            <FlatButton
              color={theme.colors.primary}
              onClick={() => dispatch(['url/change', BASE_API_URL])}
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
